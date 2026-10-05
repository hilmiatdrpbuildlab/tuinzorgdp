import { siteUrl } from '$lib/server/env';
import { dienstenData } from '$lib/server/page-data';
import { getContent } from '$lib/server/site';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { content } = await getContent();
	return dienstenData(content, siteUrl());
};
