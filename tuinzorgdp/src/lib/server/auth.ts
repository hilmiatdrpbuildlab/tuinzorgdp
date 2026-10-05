/**
 * CMS sign-in (docs/cms-plan/05-cms.md): Better Auth with e-mail + password, public sign-up off,
 * and a 6-digit code by e-mail as second factor (5 minutes, device trusted for 30 days, lockout
 * after repeated wrong codes). Sessions live in Neon in an HttpOnly cookie scoped to /admin.
 */
import { dev } from '$app/environment';
import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import type { Db } from './db/client';
import * as schema from './db/schema';
import { env, siteUrl } from './env';
import { loginCodeMail, sendMail } from './mail';

export const AUTH_BASE_PATH = '/admin/api/auth';

export function createAuth(db: Db) {
	const secret =
		env('BETTER_AUTH_SECRET') ?? (dev ? 'dev-only-secret-change-me-0123456789abcdef' : undefined);
	if (!secret) throw new Error('BETTER_AUTH_SECRET is not set');

	return betterAuth({
		appName: 'TuinZorg DP',
		baseURL: env('BETTER_AUTH_URL') ?? siteUrl(),
		basePath: AUTH_BASE_PATH,
		secret,
		database: drizzleAdapter(db, {
			provider: 'pg',
			schema: {
				user: schema.user,
				session: schema.session,
				account: schema.account,
				verification: schema.verification,
				twoFactor: schema.twoFactor
			}
		}),
		emailAndPassword: {
			enabled: true,
			disableSignUp: true,
			minPasswordLength: 12,
			maxPasswordLength: 128
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24
		},
		rateLimit: { enabled: true, window: 60, max: 30 },
		advanced: {
			cookiePrefix: 'tz',
			useSecureCookies: !dev,
			defaultCookieAttributes: { path: '/admin', sameSite: 'lax', httpOnly: true, secure: !dev },
			ipAddress: { disableIpTracking: true }
		},
		plugins: [
			twoFactor({
				issuer: 'TuinZorg DP',
				skipVerificationOnEnable: true,
				trustDeviceMaxAge: 60 * 60 * 24 * 30,
				totpOptions: { disable: true },
				otpOptions: {
					digits: 6,
					period: 5,
					allowedAttempts: 5,
					storeOTP: 'hashed',
					async sendOTP({ user, otp }) {
						await sendMail(loginCodeMail(user.email, otp));
					}
				},
				accountLockout: { enabled: true, maxFailedAttempts: 8, durationSeconds: 15 * 60 }
			}),
			sveltekitCookies(getRequestEvent)
		]
	});
}

export type Auth = ReturnType<typeof createAuth>;
