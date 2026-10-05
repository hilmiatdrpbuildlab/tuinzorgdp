/** Limits and publishing guards shared by the CMS, the build verification and the tests. */

export const LIMITS = {
	seoTitle: 62,
	metaDescription: 158,
	summary: 160,
	message: 600,
	bullets: 6,
	areaIntroWords: 80,
	requestPhotos: 5,
	requestPhotoBytes: 10 * 1024 * 1024,
	requestTotalBytes: 25 * 1024 * 1024,
	cmsUploadBytes: 10 * 1024 * 1024,
	homeGallery: 12,
	homeReviews: 6,
	socialPosts: 6
} as const;

export function wordCount(text: string | null | undefined): number {
	if (!text) return 0;
	const words = text
		.replace(/[#*_>`[\]()]/g, ' ')
		.split(/\s+/)
		.filter((w) => /[\p{L}\p{N}]/u.test(w));
	return words.length;
}

export type Guard = { field: string; message: string };

export function projectGuards(p: {
	cover_media_id: string | null;
	galleryCount: number;
	missingAlt: number;
}): Guard[] {
	const out: Guard[] = [];
	if (!p.cover_media_id)
		out.push({ field: 'cover', message: 'Kies een omslagfoto voor deze realisatie.' });
	if (p.galleryCount < 1)
		out.push({ field: 'photos', message: 'Voeg minstens één foto toe aan de galerij.' });
	if (p.missingAlt > 0)
		out.push({
			field: 'photos',
			message: `${p.missingAlt} foto${p.missingAlt === 1 ? ' heeft' : "'s hebben"} nog geen alt-tekst. Beschrijf wat je ziet.`
		});
	return out;
}

export function reviewGuards(r: { consent_confirmed: boolean }): Guard[] {
	return r.consent_confirmed
		? []
		: [
				{
					field: 'consent_confirmed',
					message: 'Vink aan dat de klant toestemming gaf voor u de review publiceert.'
				}
			];
}

export function areaGuards(a: { intro: string | null }): Guard[] {
	const words = wordCount(a.intro);
	return words >= LIMITS.areaIntroWords
		? []
		: [
				{
					field: 'intro',
					message: `De intro heeft ${words} woorden. Schrijf er minstens ${LIMITS.areaIntroWords}, zodat deze pagina niet op een andere lijkt.`
				}
			];
}

export function seoGuards(s: {
	seo_title?: string | null;
	meta_description?: string | null;
}): Guard[] {
	const out: Guard[] = [];
	if ((s.seo_title?.length ?? 0) > LIMITS.seoTitle)
		out.push({
			field: 'seo_title',
			message: `De SEO-titel is langer dan ${LIMITS.seoTitle} tekens.`
		});
	if ((s.meta_description?.length ?? 0) > LIMITS.metaDescription)
		out.push({
			field: 'meta_description',
			message: `De beschrijving is langer dan ${LIMITS.metaDescription} tekens.`
		});
	return out;
}

/** Lowercase Dutch slug: accents folded, words joined with hyphens. */
export function slugify(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/&/g, ' en ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

/** Old and new path for a renamed slug, or null when nothing changes. */
export function slugRedirect(prefix: string, oldSlug: string, newSlug: string) {
	if (!oldSlug || oldSlug === newSlug) return null;
	return {
		from_path: `${prefix}/${oldSlug}`,
		to_path: `${prefix}/${newSlug}`,
		status: 301 as const
	};
}
