import { env, isTestSite, siteUrl } from '$lib/server/env';
import { layoutData } from '$lib/server/page-data';
import { getContent } from '$lib/server/site';
import type { LayoutServerLoad } from './$types';

// Every public page is prerendered from published rows; the Worker never renders them.
export const prerender = true;
export const trailingSlash = 'never';

export const load: LayoutServerLoad = async () => {
	const { content } = await getContent();
	return layoutData(content, {
		url: siteUrl(),
		testSite: isTestSite(),
		analyticsToken: env('PUBLIC_CF_ANALYTICS_TOKEN') ?? null,
		turnstileSiteKey: env('PUBLIC_TURNSTILE_SITE_KEY') ?? null
	});
};
