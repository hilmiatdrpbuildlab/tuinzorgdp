import { fail, redirect } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';
import { authMessage } from '$lib/server/auth-flow';
import { requireUser } from '$lib/server/cms';
import type { Actions, PageServerLoad } from './$types';

const MIN_PASSWORD = 12;
const MAX_PASSWORD = 128;

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	return { email: user.email, minPassword: MIN_PASSWORD };
};

export const actions: Actions = {
	/** Changes the password and signs out every other device. */
	password: async ({ request, locals }) => {
		requireUser(locals);
		const form = await request.formData();
		// Passwords are read as typed (not trimmed, unlike fields()): spaces count.
		const raw = (k: string) => {
			const v = form.get(k);
			return typeof v === 'string' ? v : '';
		};
		const currentPassword = raw('current');
		const newPassword = raw('new');
		const repeat = raw('repeat');

		const errors: Record<string, string> = {};
		if (!currentPassword) errors.current = 'Vul uw huidige wachtwoord in.';
		if (newPassword.length < MIN_PASSWORD)
			errors.new = `Kies een wachtwoord van minstens ${MIN_PASSWORD} tekens.`;
		else if (newPassword.length > MAX_PASSWORD)
			errors.new = `Een wachtwoord heeft hoogstens ${MAX_PASSWORD} tekens.`;
		else if (newPassword === currentPassword)
			errors.new = 'Kies een ander wachtwoord dan het huidige.';
		if (!errors.new && repeat !== newPassword)
			errors.repeat = 'De twee wachtwoorden zijn niet gelijk.';
		if (Object.keys(errors).length) return fail(400, { errors, message: 'Controleer de velden.' });

		try {
			const auth = createAuth(await locals.db());
			await auth.api.changePassword({
				body: { currentPassword, newPassword, revokeOtherSessions: true },
				headers: request.headers
			});
		} catch (e) {
			const code = (e as { body?: { code?: string } })?.body?.code ?? '';
			if (code === 'INVALID_PASSWORD' || code === 'INVALID_EMAIL_OR_PASSWORD') {
				return fail(400, {
					errors: { current: 'Dit wachtwoord klopt niet.' },
					message: 'Uw huidige wachtwoord klopt niet.'
				});
			}
			if (/PASSWORD_TOO_(SHORT|LONG)/.test(code)) {
				return fail(400, {
					errors: { new: `Kies een wachtwoord van ${MIN_PASSWORD} tot ${MAX_PASSWORD} tekens.` },
					message: 'Controleer de velden.'
				});
			}
			console.error('[auth] change password failed', e);
			return fail(400, {
				errors: {},
				message: authMessage(e).replace(
					'Aanmelden lukte niet',
					'Het wachtwoord wijzigen lukte niet'
				)
			});
		}
		return { saved: true };
	},
	signout: async ({ request, locals }) => {
		requireUser(locals);
		const auth = createAuth(await locals.db());
		try {
			await auth.api.signOut({ headers: request.headers });
		} catch (e) {
			console.error('[auth] sign-out failed', e);
		}
		redirect(303, '/admin/login');
	}
};
