import { error } from '@sveltejs/kit';
import { adminSrc } from '$lib/server/admin-media';
import { requireUser } from '$lib/server/cms';
import { buildContent, readRaw } from '$lib/server/content';
import { siteUrl } from '$lib/server/env';
import * as pages from '$lib/server/page-data';
import type { PageServerLoad } from './$types';

/**
 * Preview: the public page rendered from draft content (unpublished rows included), with photos
 * served from the bucket, using the same page-data functions and components as the build.
 */
export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const raw = await readRaw(await locals.db());
	const content = buildContent(raw, { drafts: true, mediaSrc: (m) => adminSrc(m.id) });
	const url = siteUrl();
	const layout = pages.layoutData(content, {
		url,
		testSite: true,
		analyticsToken: null,
		turnstileSiteKey: null
	});
	const [first, second] = (params.path ?? '').split('/').filter(Boolean);

	let kind: string;
	let data: object | null;
	if (!first) [kind, data] = ['home', pages.homeData(content, url)];
	else if (first === 'diensten' && !second)
		[kind, data] = ['diensten', pages.dienstenData(content, url)];
	else if (first === 'diensten') [kind, data] = ['dienst', pages.serviceData(content, url, second)];
	else if (first === 'realisaties' && !second)
		[kind, data] = ['realisaties', pages.realisatiesData(content, url)];
	else if (first === 'realisaties')
		[kind, data] = ['realisatie', pages.projectData(content, url, second)];
	else if (first === 'tuinonderhoud' && second)
		[kind, data] = ['gemeente', pages.areaData(content, url, second)];
	else if (first === 'contact') [kind, data] = ['contact', pages.contactData(content, url)];
	else if (first === 'privacy') [kind, data] = ['privacy', pages.privacyData(content, url)];
	else error(404, 'Geen voorbeeld voor deze pagina');
	if (!data) error(404, 'Niet gevonden');

	return { kind, ...layout, ...data, path: `/${params.path ?? ''}` };
};
