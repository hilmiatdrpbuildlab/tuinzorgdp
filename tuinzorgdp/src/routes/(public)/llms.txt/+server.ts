import { llmsTxt } from '$lib/llms';
import { siteUrl } from '$lib/server/env';
import { getContent } from '$lib/server/site';
import type { RequestHandler } from './$types';

export const prerender = true;

/** /llms.txt for generative search engines, from the published content (src/lib/llms.ts). */
export const GET: RequestHandler = async () => {
	const { content } = await getContent();
	return new Response(llmsTxt(content, siteUrl()), {
		headers: { 'content-type': 'text/markdown; charset=utf-8' }
	});
};
