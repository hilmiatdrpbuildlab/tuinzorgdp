/** Helpers for calling Better Auth from SvelteKit form actions. */
import type { RequestEvent } from '@sveltejs/kit';

/** Request headers with the cookies set earlier in this same request (e.g. the 2FA cookie). */
export function headersWithCookies(event: RequestEvent): Headers {
	const h = new Headers(event.request.headers);
	const all = event.cookies.getAll();
	if (all.length)
		h.set('cookie', all.map((c) => `${c.name}=${encodeURIComponent(c.value)}`).join('; '));
	return h;
}

/** The Dutch message for a Better Auth error code. */
export function authMessage(e: unknown): string {
	const err = e as { body?: { code?: string; message?: string }; message?: string };
	const code = err?.body?.code ?? '';
	switch (code) {
		case 'INVALID_EMAIL_OR_PASSWORD':
		case 'INVALID_EMAIL':
		case 'INVALID_PASSWORD':
			return 'Het e-mailadres of het wachtwoord klopt niet.';
		case 'INVALID_CODE':
		case 'INVALID_TWO_FACTOR_CODE':
			return 'Deze code klopt niet. Controleer de laatste mail en probeer opnieuw.';
		case 'OTP_HAS_EXPIRED':
			return 'Deze code is verlopen. Vraag een nieuwe code.';
		case 'TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE':
			return 'Te veel pogingen met deze code. Vraag een nieuwe code.';
		case 'INVALID_TWO_FACTOR_COOKIE':
			return 'Uw aanmelding is verlopen. Log opnieuw in.';
		case 'ACCOUNT_LOCKED':
		case 'TWO_FACTOR_LOCKED':
		case 'TOO_MANY_FAILED_ATTEMPTS':
			return 'Uw account is tijdelijk vergrendeld na te veel foute codes. Probeer het over 15 minuten opnieuw.';
		default:
			if (/lock/i.test(code) || /lock/i.test(err?.body?.message ?? '')) {
				return 'Uw account is tijdelijk vergrendeld na te veel foute codes. Probeer het over 15 minuten opnieuw.';
			}
			return 'Aanmelden lukte niet. Probeer opnieuw.';
	}
}
