import type { Media } from '$lib/content/types';

/** Widths written by scripts/build-images.ts; never wider than the original or 2400 px. */
export const VARIANT_WIDTHS = [480, 960, 1600, 2400];

export function variantWidths(width: number): number[] {
	const max = Math.min(width, 2400);
	const list = VARIANT_WIDTHS.filter((w) => w < max);
	return [...list, max];
}

export function mediaSrc(m: Media, width: number): string {
	if (m.src) return m.src;
	return `/media/${m.id}-${width}.webp`;
}

export function srcset(m: Media): string | undefined {
	if (m.src) return undefined;
	return variantWidths(m.width)
		.map((w) => `${mediaSrc(m, w)} ${w}w`)
		.join(', ');
}

/** Default src: the variant closest to 960 px. */
export function defaultSrc(m: Media): string {
	const widths = variantWidths(m.width);
	const w = widths.find((x) => x >= 960) ?? widths[widths.length - 1];
	return mediaSrc(m, w);
}

export const objectPosition = (m: Media) =>
	`${Math.round(m.focalX * 100)}% ${Math.round(m.focalY * 100)}%`;

/** `sizes` per slot, from design-system/guide/5-cms.md. */
export const SIZES = {
	hero: '100vw',
	service: '(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw',
	featured: '(min-width: 900px) 66vw, 100vw',
	gallery: '(min-width: 1100px) 25vw, (min-width: 768px) 33vw, 50vw',
	galleryLarge: '(min-width: 1100px) 33vw, 50vw',
	social: '(min-width: 1024px) 16vw, 50vw',
	half: '(min-width: 1024px) 50vw, 100vw',
	third: '(min-width: 1024px) 33vw, 100vw',
	lightbox: '100vw'
} as const;

export type Ratio = '21x9' | '16x9' | '3x2' | '4x3' | '1x1' | '4x5' | '3x4' | '2x3' | 'free';

const GALLERY_RATIOS: { name: Ratio; value: number }[] = [
	{ name: '4x3', value: 4 / 3 },
	{ name: '1x1', value: 1 },
	{ name: '4x5', value: 4 / 5 },
	{ name: '3x4', value: 3 / 4 },
	{ name: '2x3', value: 2 / 3 }
];

/** Portrait phone photos snap to 3:4 almost always; this rhythm (from design-system/home-page.html) keeps the masonry staggered. */
const PORTRAIT_RHYTHM: Ratio[] = [
	'3x4',
	'4x3',
	'1x1',
	'3x4',
	'2x3',
	'4x3',
	'4x5',
	'1x1',
	'3x4',
	'4x5',
	'4x3',
	'1x1'
];

export function snapRatio(width: number, height: number): Ratio {
	const r = width / height;
	let best = GALLERY_RATIOS[0];
	for (const c of GALLERY_RATIOS) if (Math.abs(c.value - r) < Math.abs(best.value - r)) best = c;
	return best.name;
}

/**
 * The gallery tile ratio for a photo: its own size snapped to 3:4, 4:5, 1:1, 4:3 or 2:3.
 * Landscape and square photos keep their snapped ratio; portrait photos follow the rhythm by position.
 */
export function galleryRatio(width: number, height: number, index: number): Ratio {
	const snapped = snapRatio(width, height);
	if (width >= height) return snapped;
	return PORTRAIT_RHYTHM[index % PORTRAIT_RHYTHM.length];
}
