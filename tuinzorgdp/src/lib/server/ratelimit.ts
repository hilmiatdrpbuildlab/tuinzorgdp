/**
 * 5 submissions per IP per 10 minutes. The Cloudflare binding (SUBMIT_LIMITER, 5 per 60 s) stops
 * bursts at the edge; the 10-minute window is counted in submit_attempts, which holds an HMAC of the
 * IP and the hour (never the IP) and forgets rows after 10 minutes.
 */
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import type { Db } from './db/client';
import * as schema from './db/schema';

export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_IN_WINDOW = 5;

const enc = new TextEncoder();

export async function ipKey(ip: string, secret: string, now = new Date()): Promise<string> {
	const k = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const hour = now.toISOString().slice(0, 13);
	const sig = await crypto.subtle.sign('HMAC', k, enc.encode(`${ip}|${hour}`));
	return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Records this attempt and says whether it is over the limit. */
export async function overWindowLimit(db: Db, key: string, now = new Date()): Promise<boolean> {
	const since = new Date(now.getTime() - WINDOW_MS);
	await db.delete(schema.submitAttempts).where(lt(schema.submitAttempts.created_at, since));
	const [row] = await db
		.select({ n: sql<number>`count(*)::int` })
		.from(schema.submitAttempts)
		.where(
			and(eq(schema.submitAttempts.key_hash, key), gt(schema.submitAttempts.created_at, since))
		);
	if ((row?.n ?? 0) >= MAX_IN_WINDOW) return true;
	await db.insert(schema.submitAttempts).values({ key_hash: key, created_at: now });
	return false;
}

export async function verifyTurnstileToken(
	secret: string | undefined,
	token: string | null,
	ip: string | null,
	fetcher: typeof fetch = fetch
): Promise<boolean> {
	if (!secret) return true; // Not configured (local development).
	if (!token) return false;
	const body = new FormData();
	body.set('secret', secret);
	body.set('response', token);
	if (ip) body.set('remoteip', ip);
	try {
		const res = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body
		});
		const data = (await res.json()) as { success?: boolean };
		return !!data.success;
	} catch {
		return false;
	}
}
