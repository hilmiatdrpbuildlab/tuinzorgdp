/**
 * Creates the one CMS account, or resets its password. Sign-up is disabled in the app, so this is
 * the only way in. The e-mail code (second factor) is on unless --no-code is given; use --no-code
 * only while no mail service is connected, and run the script again without it once Brevo works.
 *
 *   ADMIN_EMAIL=owner@example.be npm run seed:account -- --password "a long passphrase"
 *   ADMIN_EMAIL=owner@example.be npm run seed:account -- --no-code   (password only)
 *   (without --password a random one is generated and printed once)
 */
import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';
import { randomBytes, randomUUID } from 'node:crypto';
import { openDb, schema } from './lib/db';
import { env, requireEnv } from './lib/env';

const email = requireEnv('ADMIN_EMAIL').trim().toLowerCase();
const withCode = !process.argv.includes('--no-code');
const i = process.argv.indexOf('--password');
const given = i > -1 ? process.argv[i + 1] : undefined;
const password = given ?? randomBytes(15).toString('base64url');
if (password.length < 12) {
	console.error('The password needs at least 12 characters.');
	process.exit(1);
}

const { db, close, local } = await openDb(env('DATABASE_URL'));
const hash = await hashPassword(password);
const now = new Date();

let [user] = await db.select().from(schema.user).where(eq(schema.user.email, email));
if (!user) {
	[user] = await db
		.insert(schema.user)
		.values({
			id: randomUUID(),
			email,
			name: env('ADMIN_NAME') ?? 'TuinZorg DP',
			emailVerified: true,
			twoFactorEnabled: withCode,
			createdAt: now,
			updatedAt: now
		})
		.returning();
} else {
	await db
		.update(schema.user)
		.set({ twoFactorEnabled: withCode, updatedAt: now })
		.where(eq(schema.user.id, user.id));
}

const [acc] = await db
	.select()
	.from(schema.account)
	.where(and(eq(schema.account.userId, user.id), eq(schema.account.providerId, 'credential')));
if (acc)
	await db
		.update(schema.account)
		.set({ password: hash, updatedAt: now })
		.where(eq(schema.account.id, acc.id));
else
	await db.insert(schema.account).values({
		id: randomUUID(),
		accountId: user.id,
		providerId: 'credential',
		userId: user.id,
		password: hash,
		createdAt: now,
		updatedAt: now
	});

// The two_factor row carries the lockout counter; TOTP is not used (verified = false), only e-mail codes.
const [tf] = await db.select().from(schema.twoFactor).where(eq(schema.twoFactor.userId, user.id));
if (tf)
	await db
		.update(schema.twoFactor)
		.set({ failedVerificationCount: 0, lockedUntil: null })
		.where(eq(schema.twoFactor.id, tf.id));
else
	await db.insert(schema.twoFactor).values({
		id: randomUUID(),
		userId: user.id,
		secret: 'otp-only',
		backupCodes: '[]',
		verified: false
	});

// A reset signs out every session.
await db.delete(schema.session).where(eq(schema.session.userId, user.id));

console.log(
	`[seed-account] ${acc ? 'password reset for' : 'created'} ${email} (${local ? 'local PGlite' : 'Neon'})`
);
console.log(`[seed-account] login code by e-mail: ${withCode ? 'on' : 'OFF (password only)'}`);
if (!given) console.log(`[seed-account] password: ${password}`);
await close();
