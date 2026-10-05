import { fail, redirect } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';
import { authMessage, headersWithCookies } from '$lib/server/auth-flow';
import type { Actions, PageServerLoad } from './$types';

const RESEND_AFTER_MS = 60_000;

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (locals.user) redirect(303, '/admin');
	const sent = Number(cookies.get('tz_otp_sent') ?? 0);
	return { resendIn: Math.max(0, Math.ceil((sent + RESEND_AFTER_MS - Date.now()) / 1000)) };
};

export const actions: Actions = {
	verify: async (event) => {
		const form = await event.request.formData();
		const code = String(form.get('code') ?? '').replace(/\D/g, '');
		const trustDevice = form.get('trust') === 'on';
		if (code.length !== 6) return fail(400, { message: 'De code heeft 6 cijfers.' });
		const auth = createAuth(await event.locals.db());
		try {
			await auth.api.verifyTwoFactorOTP({
				body: { code, trustDevice },
				headers: event.request.headers
			});
		} catch (e) {
			return fail(400, { message: authMessage(e) });
		}
		event.cookies.delete('tz_otp_sent', { path: '/admin/login' });
		redirect(303, '/admin');
	},
	resend: async (event) => {
		const sent = Number(event.cookies.get('tz_otp_sent') ?? 0);
		if (Date.now() - sent < RESEND_AFTER_MS)
			return fail(429, { message: 'Wacht een minuut voor u een nieuwe code vraagt.' });
		const auth = createAuth(await event.locals.db());
		try {
			await auth.api.sendTwoFactorOTP({ body: {}, headers: headersWithCookies(event) });
		} catch (e) {
			return fail(400, { message: authMessage(e) });
		}
		event.cookies.set('tz_otp_sent', String(Date.now()), {
			path: '/admin/login',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 600
		});
		return { resent: true };
	}
};
