import { siteUrl } from '$lib/server/env';
import { getContent } from '$lib/server/site';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const { content } = await getContent();
	const url = siteUrl();
	const paths = [
		'/',
		'/diensten',
		...content.services.map((s) => `/diensten/${s.slug}`),
		'/realisaties',
		...content.projects.map((p) => `/realisaties/${p.slug}`),
		...content.areas.map((a) => `/tuinonderhoud/${a.slug}`),
		'/contact',
		...(content.pages.privacy && !content.pages.privacy.noindex ? ['/privacy'] : [])
	];
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		paths.map((p) => `  <url><loc>${url}${p}</loc></url>`).join('\n') +
		'\n</urlset>\n';
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
