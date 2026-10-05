/**
 * The unlock-link gate in front of /admin (docs/cms-plan/05-cms.md). Opening /admin/unlock?k=<key>
 * sets an HttpOnly cookie holding an HMAC of the key; without it every /admin request is a bare 404,
 * so a branded login form on a *.workers.dev URL is never shown to strangers.
 */
export const GATE_COOKIE = 'tz_gate';
export const GATE_MAX_AGE = 60 * 60 * 24 * 180;

const enc = new TextEncoder();

async function hmac(key: string, message: string): Promise<string> {
	const k = await crypto.subtle.importKey(
		'raw',
		enc.encode(key),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign('HMAC', k, enc.encode(message));
	return btoa(String.fromCharCode(...new Uint8Array(sig)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export function gateToken(unlockKey: string): Promise<string> {
	return hmac(unlockKey, 'tuinzorgdp-admin-gate-v1');
}

export function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

export async function gateOpen(
	unlockKey: string | undefined,
	cookie: string | undefined,
	dev: boolean
) {
	// Locally an empty key turns the gate off; deployed without a key, /admin stays closed.
	if (!unlockKey) return dev;
	if (!cookie) return false;
	return timingSafeEqual(cookie, await gateToken(unlockKey));
}

export function notFound() {
	return new Response('Not Found', {
		status: 404,
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex'
		}
	});
}
