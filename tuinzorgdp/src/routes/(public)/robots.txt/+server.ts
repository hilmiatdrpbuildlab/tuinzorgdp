import { isTestSite, siteUrl } from '$lib/server/env';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	// The *.workers.dev build blocks every crawler until the domain move (docs/cms-plan/06-public-site.md).
	const body = isTestSite()
		? 'User-agent: *\nDisallow: /\n'
		: `User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl()}/sitemap.xml\n`;
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
