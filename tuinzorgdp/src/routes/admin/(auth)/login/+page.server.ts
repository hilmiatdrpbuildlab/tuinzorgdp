import { fail, redirect } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';
import { authMessage, headersWithCookies } from '$lib/server/auth-flow';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/admin');
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		if (!email || !password)
			return fail(400, { email, message: 'Vul uw e-mailadres en wachtwoord in.' });

		const auth = createAuth(await event.locals.db());
		let result: { twoFactorRedirect?: boolean } | undefined;
		try {
			result = (await auth.api.signInEmail({
				body: { email, password, rememberMe: true },
				headers: event.request.headers
			})) as { twoFactorRedirect?: boolean };
		} catch (e) {
			return fail(400, { email, message: authMessage(e) });
		}

		// A trusted device skips the code; otherwise mail a 6-digit code.
		if (result?.twoFactorRedirect) {
			try {
				await auth.api.sendTwoFactorOTP({ body: {}, headers: headersWithCookies(event) });
			} catch (e) {
				return fail(500, { email, message: authMessage(e) });
			}
			event.cookies.set('tz_otp_sent', String(Date.now()), {
				path: '/admin/login',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 600
			});
			redirect(303, '/admin/login/code');
		}
		redirect(303, '/admin');
	}
};
