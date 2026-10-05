import { error } from '@sveltejs/kit';
import { siteUrl } from '$lib/server/env';
import { serviceData } from '$lib/server/page-data';
import { getContent } from '$lib/server/site';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const { content } = await getContent();
	return content.services.map((s) => ({ slug: s.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const { content } = await getContent();
	return serviceData(content, siteUrl(), params.slug) ?? error(404, 'Niet gevonden');
};
