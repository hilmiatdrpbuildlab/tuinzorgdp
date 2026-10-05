import { buildContent, readRaw, seedRaw, type RawContent } from '../../src/lib/server/content';
import { openHttp } from './db';
import { env } from './env';

/** The same rows the prerender reads: Neon through tz_build, or the seed content. */
export async function loadRaw(): Promise<{ raw: RawContent; source: 'neon' | 'seed' }> {
	const url = env('DATABASE_URL_BUILD');
	if (!url) return { raw: seedRaw(), source: 'seed' };
	return { raw: await readRaw(openHttp(url)), source: 'neon' };
}

export { buildContent };
