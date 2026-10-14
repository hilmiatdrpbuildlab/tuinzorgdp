import { siteUrl } from '$lib/server/env';
import { getContent } from '$lib/server/site';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const { content } = await getContent();
	const url = siteUrl();
	const latest = (dates: (string | null)[]) =>
		dates
			.filter((d): d is string => !!d)
			.sort()
			.at(-1) ?? null;
	const services = latest(content.services.map((s) => s.updatedOn));
	const projects = latest(content.projects.map((p) => p.updatedOn));
	const everything = latest([services, projects, ...content.areas.map((a) => a.updatedOn)]);
	// lastmod tells search and answer engines which pages changed since their last visit.
	const entries: [string, string | null][] = [
		['/', everything],
		['/diensten', services],
		...content.services.map((s): [string, string | null] => [`/diensten/${s.slug}`, s.updatedOn]),
		['/realisaties', projects],
		...content.projects.map((p): [string, string | null] => [
			`/realisaties/${p.slug}`,
			p.updatedOn
		]),
		...content.areas.map((a): [string, string | null] => [`/tuinonderhoud/${a.slug}`, a.updatedOn]),
		['/contact', null],
		...(content.pages.privacy && !content.pages.privacy.noindex
			? [['/privacy', null] as [string, null]]
			: [])
	];
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		entries
			.map(
				([p, mod]) => `  <url><loc>${url}${p}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`
			)
			.join('\n') +
		'\n</urlset>\n';
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
