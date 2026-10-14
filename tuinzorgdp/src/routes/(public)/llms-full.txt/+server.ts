import { llmsFullTxt } from '$lib/llms';
import { siteUrl } from '$lib/server/env';
import { getContent } from '$lib/server/site';
import type { RequestHandler } from './$types';

export const prerender = true;

/** /llms-full.txt: every service, realisatie and answer in full, from the published content. */
export const GET: RequestHandler = async () => {
	const { content } = await getContent();
	return new Response(llmsFullTxt(content, siteUrl()), {
		headers: { 'content-type': 'text/markdown; charset=utf-8' }
	});
};
