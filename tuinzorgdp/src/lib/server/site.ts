/**
 * Build-time content for the prerendered pages. Reads Neon with the read-only tz_build role
 * (DATABASE_URL_BUILD); without it, the seed content is used so the build works offline.
 */
import type { SiteContent } from '$lib/content/types';
import { connectHttp } from './db/client';
import { buildContent, readRaw, seedRaw } from './content';
import { env } from './env';

let cached: Promise<{ content: SiteContent; source: 'neon' | 'seed' }> | null = null;

export function getContent() {
	if (!cached) {
		cached = (async () => {
			const url = env('DATABASE_URL_BUILD');
			if (!url) {
				console.warn('[content] DATABASE_URL_BUILD is not set: building from the seed content.');
				return { content: buildContent(seedRaw()), source: 'seed' as const };
			}
			const raw = await readRaw(connectHttp(url));
			return { content: buildContent(raw), source: 'neon' as const };
		})();
	}
	return cached;
}
