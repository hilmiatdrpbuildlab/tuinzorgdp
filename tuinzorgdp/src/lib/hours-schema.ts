import type { SiteSettings } from '$lib/content/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** schema.org day names, or null when the client has not set any. */
export function hoursDays(h: SiteSettings['hours']): string[] | null {
	const days = (h.days ?? []).filter((d) => DAYS.includes(d));
	return days.length ? days : null;
}
