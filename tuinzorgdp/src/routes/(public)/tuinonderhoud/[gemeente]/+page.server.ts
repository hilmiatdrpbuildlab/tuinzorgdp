import { error } from '@sveltejs/kit';
import { siteUrl } from '$lib/server/env';
import { areaData } from '$lib/server/page-data';
import { getContent } from '$lib/server/site';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const { content } = await getContent();
	return content.areas.map((a) => ({ gemeente: a.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const { content } = await getContent();
	return areaData(content, siteUrl(), params.gemeente) ?? error(404, 'Niet gevonden');
};
