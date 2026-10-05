/** Display helpers following the design system's content rules (README, "Content and voice"). */

/** `+32 469 41 37 30` → `tel:+32469413730`. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** `+32 469 41 37 30` → `0469 41 37 30`, for tight spots. */
export function shortPhone(phone: string): string {
	const m = /^\+32\s?(.*)$/.exec(phone.trim());
	return m ? `0${m[1]}` : phone;
}

export const whatsappHref = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`;

const MONTHS = [
	'januari',
	'februari',
	'maart',
	'april',
	'mei',
	'juni',
	'juli',
	'augustus',
	'september',
	'oktober',
	'november',
	'december'
];

/** Day first: `5 oktober 2026`. */
export function formatDate(value: string | Date | null | undefined): string {
	if (!value) return '';
	const d =
		typeof value === 'string'
			? new Date(value.length === 10 ? `${value}T12:00:00Z` : value)
			: value;
	if (Number.isNaN(d.getTime())) return '';
	return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateTime(value: string | Date): string {
	const d = typeof value === 'string' ? new Date(value) : value;
	const time = d.toLocaleTimeString('nl-BE', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'Europe/Brussels'
	});
	const day = d.toLocaleDateString('nl-BE', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'Europe/Brussels'
	});
	return `${day}, ${time}`;
}

/** Score with a decimal comma: 4.9 → `4,9`. */
export const formatScore = (n: number) => n.toFixed(1).replace('.', ',');

/** Joins names Dutch style: `a, b en c`. */
export function joinNl(items: string[]): string {
	if (items.length <= 1) return items[0] ?? '';
	return `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`;
}

export const initial = (name: string) => (name.trim()[0] ?? '?').toUpperCase();
