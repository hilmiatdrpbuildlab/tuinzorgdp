import { isTestSite, siteUrl } from '$lib/server/env';
import type { RequestHandler } from './$types';

export const prerender = true;

/**
 * AI search engines and assistants that quote and link their sources. They are welcome, named
 * explicitly so a reader of this file (or a Cloudflare default) does not take them for blocked.
 */
const ANSWER_ENGINES = [
	'OAI-SearchBot',
	'ChatGPT-User',
	'GPTBot',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'bingbot'
];

const RULES = 'Allow: /\nDisallow: /admin\nDisallow: /api/\n';

export const GET: RequestHandler = () => {
	// The *.workers.dev build blocks every crawler until the domain move (docs/cms-plan/06-public-site.md).
	const body = isTestSite()
		? 'User-agent: *\nDisallow: /\n'
		: `User-agent: *\n${RULES}\n` +
			`# AI search engines and assistants\n${ANSWER_ENGINES.map((ua) => `User-agent: ${ua}`).join('\n')}\n${RULES}\n` +
			`Sitemap: ${siteUrl()}/sitemap.xml\n`;
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
