import type { SiteSettings } from '$lib/content/types';

const DAY_NL: Record<string, string> = {
	Monday: 'ma',
	Tuesday: 'di',
	Wednesday: 'wo',
	Thursday: 'do',
	Friday: 'vr',
	Saturday: 'za',
	Sunday: 'zo'
};
const ORDER = Object.keys(DAY_NL);

/** Opening hours as one line, e.g. `Ma tot za, 08:00–18:00`, or the free text the client typed. */
export function hoursText(h: SiteSettings['hours']): string | null {
	if (h.label) return h.label;
	if (!h.opens || !h.closes) return null;
	const days = (h.days ?? [])
		.filter((d) => d in DAY_NL)
		.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
	let range = '';
	if (days.length) {
		const consecutive = days.every(
			(d, i) => i === 0 || ORDER.indexOf(d) === ORDER.indexOf(days[i - 1]) + 1
		);
		range =
			consecutive && days.length > 2
				? `${DAY_NL[days[0]]} tot ${DAY_NL[days[days.length - 1]]}`
				: days.map((d) => DAY_NL[d]).join(', ');
		range = range.charAt(0).toUpperCase() + range.slice(1) + ', ';
	}
	return `${range}${h.opens}–${h.closes}`;
}
