import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { env, siteUrl } from '$lib/server/env';
import { sendMail } from '$lib/server/mail';
import { ipKey, overWindowLimit, verifyTurnstileToken } from '$lib/server/ratelimit';
import { processSubmission } from '$lib/server/requests';
import { storage } from '$lib/server/storage';

export const prerender = false;

const MAX_BODY = 30 * 1024 * 1024;

export const POST: RequestHandler = async (event) => {
	const { request, platform, locals } = event;
	const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
	const answer = (status: number, body: Record<string, unknown>, redirectTo: string) =>
		wantsJson
			? json(body, { status })
			: new Response(null, { status: 303, headers: { location: redirectTo } });

	if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) {
		return answer(
			413,
			{
				ok: false,
				errors: { fotos: "Samen zijn de foto's groter dan 25 MB. Kies minder of kleinere foto's." }
			},
			'/formulier-fout'
		);
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return answer(
			400,
			{ ok: false, message: 'Het formulier kon niet gelezen worden. Probeer opnieuw.' },
			'/formulier-fout'
		);
	}

	let ip: string | null = null;
	try {
		ip = event.getClientAddress();
	} catch {
		ip = null;
	}

	const result = await processSubmission(form, {
		db: locals.db,
		storage,
		sendMail: (m) => sendMail(m),
		verifyTurnstile: (token) => verifyTurnstileToken(env('TURNSTILE_SECRET'), token, ip),
		rateLimited: async () => {
			if (!ip) return false;
			const limiter = platform?.env?.SUBMIT_LIMITER;
			if (limiter) {
				const { success } = await limiter.limit({ key: ip });
				if (!success) return true;
			}
			try {
				const secret = env('BETTER_AUTH_SECRET') ?? (dev ? 'dev' : '');
				return await overWindowLimit(await locals.db(), await ipKey(ip, secret));
			} catch {
				return false; // Neon down: the edge binding still applies.
			}
		},
		adminUrl: siteUrl(),
		notifyFallback: env('MAIL_REPLY_TO') ?? 'info@tuinzorgdp.be',
		allowNoJs: env('ALLOW_NOJS_SUBMIT') !== 'false'
	});

	switch (result.status) {
		case 'ok':
			return answer(200, { ok: true }, '/bedankt');
		case 'spam':
			// Bots get the same answer as people, so they learn nothing.
			return answer(200, { ok: true }, '/bedankt');
		case 'invalid':
			return answer(422, { ok: false, errors: result.errors }, '/formulier-fout');
		case 'limited':
			return answer(
				429,
				{
					ok: false,
					message:
						'U heeft net al een aanvraag verstuurd. Probeer het over enkele minuten opnieuw, of bel ons.'
				},
				'/formulier-fout'
			);
		default:
			return answer(
				503,
				{ ok: false, message: 'Uw aanvraag kon niet verstuurd worden. Probeer later opnieuw.' },
				'/formulier-fout'
			);
	}
};
