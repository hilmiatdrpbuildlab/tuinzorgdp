/**
 * Validation for the two lead forms, shared by the browser and /api/submit so both show the same
 * Dutch messages (wording from design-system/components/_partials/contact.html).
 */
import { z } from 'zod';
import { LIMITS } from './rules';

export const MESSAGES = {
	diensten: 'Kies minstens één dienst.',
	voornaam: 'Vul uw voornaam in.',
	achternaam: 'Vul uw achternaam in.',
	telefoon: 'Vul een telefoonnummer in waarop wij u kunnen bereiken.',
	email: 'Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.be.',
	adres: 'Vul het adres van de tuin in.',
	postcode: 'Een Belgische postcode heeft 4 cijfers.',
	gemeente: 'Vul uw gemeente in.',
	bericht: 'Beschrijf kort wat u wilt laten doen.',
	berichtLang: `Uw bericht is langer dan ${LIMITS.message} tekens.`,
	privacy: 'Vink dit aan zodat wij u mogen contacteren.',
	naam: 'Vul uw naam in.',
	vraag: 'Schrijf uw vraag.',
	telefoonOngeldig: 'Vul een geldig telefoonnummer in.'
} as const;

export const TIMING_OPTIONS = [
	'Zo snel mogelijk',
	'Binnen de maand',
	'Periodiek onderhoud',
	'Nog niet zeker'
];
export const SIZE_OPTIONS = [
	'Kleiner dan 100 m²',
	'100 tot 300 m²',
	'300 tot 1.000 m²',
	'Groter dan 1.000 m²'
];

const text = (max: number) => z.string().trim().max(max);
const required = (message: string, max = 200) =>
	z.string({ error: message }).trim().min(1, message).max(max);
const phoneRe = /^[+()\d\s./-]{8,20}$/;

export const quoteSchema = z.object({
	diensten: z.array(z.string().trim().max(60)).min(1, MESSAGES.diensten).max(12),
	voornaam: required(MESSAGES.voornaam, 80),
	achternaam: required(MESSAGES.achternaam, 80),
	telefoon: required(MESSAGES.telefoon, 30).regex(phoneRe, MESSAGES.telefoon),
	email: z.string({ error: MESSAGES.email }).trim().max(200).pipe(z.email(MESSAGES.email)),
	adres: required(MESSAGES.adres, 200),
	postcode: z
		.string({ error: MESSAGES.postcode })
		.trim()
		.regex(/^[1-9][0-9]{3}$/, MESSAGES.postcode),
	gemeente: required(MESSAGES.gemeente, 80),
	timing: z.union([z.enum(TIMING_OPTIONS as [string, ...string[]]), z.literal('')]).optional(),
	oppervlakte: z.union([z.enum(SIZE_OPTIONS as [string, ...string[]]), z.literal('')]).optional(),
	bericht: z
		.string({ error: MESSAGES.bericht })
		.trim()
		.min(1, MESSAGES.bericht)
		.max(LIMITS.message, MESSAGES.berichtLang),
	privacy: z.literal(true, { error: MESSAGES.privacy })
});

export const questionSchema = z.object({
	naam: required(MESSAGES.naam, 120),
	email: z.string({ error: MESSAGES.email }).trim().max(200).pipe(z.email(MESSAGES.email)),
	telefoon: text(30)
		.optional()
		.refine((v) => !v || phoneRe.test(v), MESSAGES.telefoonOngeldig),
	bericht: z
		.string({ error: MESSAGES.vraag })
		.trim()
		.min(1, MESSAGES.vraag)
		.max(LIMITS.message, MESSAGES.berichtLang)
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type FieldErrors = Record<string, string>;

/** FormData to a plain object the schemas understand. */
export function readForm(form: FormData, kind: 'offerte' | 'vraag'): Record<string, unknown> {
	const s = (k: string) => {
		const v = form.get(k);
		return typeof v === 'string' ? v : undefined;
	};
	if (kind === 'vraag') {
		return {
			naam: s('naam'),
			email: s('email'),
			telefoon: s('telefoon') || undefined,
			bericht: s('bericht')
		};
	}
	return {
		diensten: form.getAll('diensten').filter((v): v is string => typeof v === 'string'),
		voornaam: s('voornaam'),
		achternaam: s('achternaam'),
		telefoon: s('telefoon'),
		email: s('email'),
		adres: s('adres'),
		postcode: s('postcode'),
		gemeente: s('gemeente'),
		timing: s('timing') ?? '',
		oppervlakte: s('oppervlakte') ?? '',
		bericht: s('bericht'),
		privacy: form.get('privacy') === 'on' || form.get('privacy') === 'true'
	};
}

export function validate(
	kind: 'offerte' | 'vraag',
	input: Record<string, unknown>
): { ok: true; data: QuoteInput | QuestionInput } | { ok: false; errors: FieldErrors } {
	const result = (kind === 'offerte' ? quoteSchema : questionSchema).safeParse(input);
	if (result.success) return { ok: true, data: result.data };
	const errors: FieldErrors = {};
	for (const issue of result.error.issues) {
		const key = String(issue.path[0] ?? 'form');
		errors[key] ??= issue.message;
	}
	return { ok: false, errors };
}

/** JPEG, PNG or WebP, by their first bytes rather than the name or the browser's type. */
export function sniffImage(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
		return 'image/jpeg';
	if (
		bytes.length >= 8 &&
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47
	)
		return 'image/png';
	if (
		bytes.length >= 12 &&
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	)
		return 'image/webp';
	return null;
}

export type PhotoCheck = { ok: true } | { ok: false; message: string };

export function checkPhotos(files: { size: number }[]): PhotoCheck {
	if (files.length > LIMITS.requestPhotos)
		return { ok: false, message: `U kunt maximaal ${LIMITS.requestPhotos} foto's meesturen.` };
	if (files.some((f) => f.size > LIMITS.requestPhotoBytes))
		return { ok: false, message: 'Een foto is groter dan 10 MB. Kies een kleinere foto.' };
	if (files.reduce((n, f) => n + f.size, 0) > LIMITS.requestTotalBytes)
		return {
			ok: false,
			message: "Samen zijn de foto's groter dan 25 MB. Kies minder of kleinere foto's."
		};
	return { ok: true };
}
