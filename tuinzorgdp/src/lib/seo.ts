import { LIMITS } from '$lib/rules';

/** Shortens text at a word boundary so it fits a limit, ending with an ellipsis when cut. */
export function clampText(text: string, max: number): string {
	const t = text.replace(/\s+/g, ' ').trim();
	if (t.length <= max) return t;
	const cut = t.slice(0, max - 1);
	const at = cut.lastIndexOf(' ');
	return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

const SUFFIX = ' | TuinZorg DP';

/** `<title>`: the CMS value, or the name with the brand when it fits in 62 characters. */
export function seoTitle(custom: string | null | undefined, name: string): string {
	if (custom) return clampText(custom, LIMITS.seoTitle);
	const withBrand = `${name}${SUFFIX}`;
	return withBrand.length <= LIMITS.seoTitle ? withBrand : clampText(name, LIMITS.seoTitle);
}

export function seoDescription(custom: string | null | undefined, fallback: string): string {
	return clampText(custom || fallback, LIMITS.metaDescription);
}

export const ogImage = (m: { id: string; width: number } | null | undefined) =>
	m ? `/media/${m.id}-${Math.min(m.width, 1600)}.webp` : null;
