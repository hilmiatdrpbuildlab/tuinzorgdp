import { building, dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { createAuth, AUTH_BASE_PATH } from '$lib/server/auth';
import { connect, type Db } from '$lib/server/db/client';
import { env } from '$lib/server/env';
import {
	GATE_COOKIE,
	GATE_MAX_AGE,
	gateOpen,
	gateToken,
	notFound,
	timingSafeEqual
} from '$lib/server/gate';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/login/code'];

export const handle: Handle = async ({ event, resolve }) => {
	const state: { conn: Promise<{ db: Db; close: () => Promise<void> }> | null } = { conn: null };
	event.locals.db = async () => {
		state.conn ??= connect(env('DATABASE_URL'));
		return (await state.conn).db;
	};
	event.locals.user = null;
	event.locals.session = null;

	const path = event.url.pathname;
	const isAdmin = path === '/admin' || path.startsWith('/admin/');

	try {
		if (isAdmin && !building) {
			const unlockKey = env('ADMIN_UNLOCK_KEY');

			// 1. The unlock link sets the gate cookie once per browser.
			if (path === '/admin/unlock') {
				const k = event.url.searchParams.get('k') ?? '';
				if (!unlockKey || !timingSafeEqual(k, unlockKey)) return notFound();
				const cookie = [
					`${GATE_COOKIE}=${await gateToken(unlockKey)}`,
					'Path=/admin',
					`Max-Age=${GATE_MAX_AGE}`,
					'HttpOnly',
					'SameSite=Lax',
					...(dev ? [] : ['Secure'])
				].join('; ');
				return new Response(null, {
					status: 303,
					headers: { location: '/admin/login', 'set-cookie': cookie, 'cache-control': 'no-store' }
				});
			}

			// 2. Without the gate cookie every /admin request is a bare 404.
			if (!(await gateOpen(unlockKey, event.cookies.get(GATE_COOKIE), dev))) return notFound();

			const auth = createAuth(await event.locals.db());
			if (path.startsWith(AUTH_BASE_PATH + '/')) return auth.handler(event.request);

			// 3. Session check on every /admin load and action (mutations re-check in requireUser).
			const result = await auth.api.getSession({ headers: event.request.headers });
			if (result) {
				event.locals.user = {
					id: result.user.id,
					email: result.user.email,
					name: result.user.name
				};
				event.locals.session = { id: result.session.id, expiresAt: result.session.expiresAt };
			}
			if (!event.locals.user && !PUBLIC_ADMIN_PATHS.includes(path)) {
				if (path.startsWith('/admin/api/')) {
					return new Response('Niet aangemeld', { status: 401 });
				}
				return new Response(null, {
					status: 303,
					headers: { location: '/admin/login', 'cache-control': 'no-store' }
				});
			}
		}

		const response = await resolve(event);
		if (isAdmin) {
			response.headers.set('x-robots-tag', 'noindex, nofollow');
			response.headers.set('cache-control', 'no-store');
		}
		return response;
	} finally {
		if (state.conn) {
			const close = state.conn.then((c) => c.close()).catch(() => {});
			if (event.platform?.ctx) event.platform.ctx.waitUntil(close);
			else await close;
		}
	}
};
