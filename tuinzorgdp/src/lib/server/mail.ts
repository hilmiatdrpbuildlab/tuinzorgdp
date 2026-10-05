/**
 * Brevo transactional mail: login codes, new-request notifications and visitor confirmations.
 * Mails are plain text plus a minimal escaped HTML version; form content is never inserted as HTML.
 * Without BREVO_API_KEY in local development, mails are printed to the terminal instead.
 */
import { dev } from '$app/environment';
import { env } from './env';

export type Mail = {
	to: { email: string; name?: string };
	subject: string;
	text: string;
	replyTo?: { email: string; name?: string };
};

export const escapeHtml = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

function textToHtml(text: string): string {
	const body = escapeHtml(text)
		.split(/\n{2,}/)
		.map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br>')}</p>`)
		.join('');
	return `<!doctype html><html lang="nl"><body style="margin:0;padding:24px;background:#f4f7f4;font-family:Arial,Helvetica,sans-serif;color:#333;font-size:15px;line-height:1.55"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">${body}</div></body></html>`;
}

export async function sendMail(mail: Mail, fetcher: typeof fetch = fetch): Promise<void> {
	const key = env('BREVO_API_KEY');
	if (!key) {
		if (dev || process.env.NODE_ENV === 'test') {
			console.info(`\n[mail] to ${mail.to.email}\n[mail] ${mail.subject}\n${mail.text}\n`);
			return;
		}
		throw new Error('BREVO_API_KEY is not set');
	}
	const res = await fetcher('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
		body: JSON.stringify({
			sender: {
				email: env('MAIL_FROM') ?? 'noreply@tuinzorgdp.be',
				name: env('MAIL_FROM_NAME') ?? 'TuinZorg DP'
			},
			to: [mail.to],
			replyTo: mail.replyTo ?? { email: env('MAIL_REPLY_TO') ?? 'info@tuinzorgdp.be' },
			subject: mail.subject,
			textContent: mail.text,
			htmlContent: textToHtml(mail.text)
		})
	});
	if (!res.ok) throw new Error(`Brevo answered ${res.status}: ${await res.text()}`);
}

// ---------------------------------------------------------------- templates

export function loginCodeMail(email: string, code: string): Mail {
	return {
		to: { email },
		subject: `Uw inlogcode voor TuinZorg DP: ${code}`,
		text: `Uw code om in te loggen op het beheer van tuinzorgdp.be:\n\n${code}\n\nDe code is 5 minuten geldig. Heeft u niet geprobeerd in te loggen? Dan kunt u deze mail negeren; zonder uw wachtwoord kan niemand verder.`
	};
}

export type RequestSummary = {
	id: string;
	kind: 'offerte' | 'vraag';
	firstName: string;
	lastName?: string | null;
	email: string;
	phone?: string | null;
	street?: string | null;
	postcode?: string | null;
	municipality?: string | null;
	services: string[];
	timing?: string | null;
	gardenSize?: string | null;
	message: string;
	photosSaved: number;
	photosFailed: number;
};

export function notificationMail(r: RequestSummary, to: string, adminUrl: string): Mail {
	const name = [r.firstName, r.lastName].filter(Boolean).join(' ');
	const subject =
		r.kind === 'offerte'
			? `Offerte · ${r.municipality ?? 'onbekende gemeente'} · ${name}`
			: `Vraag · ${name}`;
	const lines = [
		r.kind === 'offerte'
			? 'Nieuwe offerteaanvraag via tuinzorgdp.be'
			: 'Nieuwe vraag via tuinzorgdp.be',
		'',
		`Naam: ${name}`,
		`E-mail: ${r.email}`,
		r.phone ? `Telefoon: ${r.phone}` : null,
		r.street ? `Adres: ${r.street}, ${r.postcode ?? ''} ${r.municipality ?? ''}`.trim() : null,
		r.services.length ? `Diensten: ${r.services.join(', ')}` : null,
		r.timing ? `Gewenste timing: ${r.timing}` : null,
		r.gardenSize ? `Oppervlakte: ${r.gardenSize}` : null,
		r.kind === 'offerte' ? `Foto's: ${r.photosSaved}` : null,
		r.photosFailed
			? `Let op: ${r.photosFailed} foto${r.photosFailed === 1 ? '' : "'s"} kon${r.photosFailed === 1 ? '' : 'den'} niet opgeslagen worden.`
			: null,
		'',
		'Bericht:',
		r.message,
		'',
		`Bekijk de aanvraag in het beheer: ${adminUrl}/admin/aanvragen/${r.id}`,
		'Antwoorden kan rechtstreeks op deze mail.'
	].filter((l): l is string => l !== null);
	return {
		to: { email: to },
		subject,
		text: lines.join('\n'),
		replyTo: { email: r.email, name }
	};
}

/** Fixed text: no form content except the first name and the chosen services. */
export function confirmationMail(r: {
	email: string;
	firstName: string;
	kind: 'offerte' | 'vraag';
	services: string[];
}): Mail {
	const what =
		r.kind === 'offerte'
			? `uw aanvraag voor een offerte${r.services.length ? ` (${r.services.join(', ')})` : ''}`
			: 'uw vraag';
	return {
		to: { email: r.email },
		subject: 'We hebben uw aanvraag goed ontvangen',
		text: `Beste ${r.firstName},\n\nBedankt voor ${what}. Wij hebben alles goed ontvangen en nemen zo snel mogelijk contact met u op.\n\nHeeft u intussen een vraag? Bel ons op +32 469 41 37 30 of antwoord op deze mail.\n\nMet vriendelijke groeten,\nTuinZorg DP`
	};
}
