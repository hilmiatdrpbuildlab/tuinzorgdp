import { siteUrl } from '$lib/server/env';
import { homeData } from '$lib/server/page-data';
import { getContent } from '$lib/server/site';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { content } = await getContent();
	return homeData(content, siteUrl());
};
