import { error } from '@sveltejs/kit';
import { siteUrl } from '$lib/server/env';
import { privacyData } from '$lib/server/page-data';
import { getContent } from '$lib/server/site';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { content } = await getContent();
	return privacyData(content, siteUrl()) ?? error(404, 'Niet gevonden');
};
