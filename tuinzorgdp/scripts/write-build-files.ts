/**
 * Before vite build: writes static/build-info.json (the CMS polls it to see a publish go live) and
 * _redirects (old WordPress URLs and renamed slugs from the redirects table).
 */
import { and, desc, inArray } from 'drizzle-orm';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildContent, loadRaw } from './lib/content';
import { openHttp, schema } from './lib/db';
import { APP_DIR, env } from './lib/env';

const buildUuid = env('WORKERS_CI_BUILD_UUID') ?? env('BUILD_ID') ?? `local-${Date.now()}`;

// The publish this build answers: the newest pending or building row (none for a plain code push).
let publishId: string | null = null;
const url = env('DATABASE_URL_BUILD');
if (url) {
	try {
		const db = openHttp(url);
		const [row] = await db
			.select({ id: schema.builds.id })
			.from(schema.builds)
			.where(and(inArray(schema.builds.status, ['pending', 'building'])))
			.orderBy(desc(schema.builds.triggered_at))
			.limit(1);
		publishId = row?.id ?? null;
		if (publishId) {
			const { eq } = await import('drizzle-orm');
			await db
				.update(schema.builds)
				.set({ status: 'building', build_uuid: buildUuid })
				.where(eq(schema.builds.id, publishId));
		}
	} catch (e) {
		console.warn('[build-files] could not read the builds table:', (e as Error).message);
	}
}

const info = { buildId: buildUuid, publishId, builtAt: new Date().toISOString() };
writeFileSync(path.join(APP_DIR, 'static/build-info.json'), JSON.stringify(info, null, 2) + '\n');
console.log(
	`[build-files] build-info.json: ${buildUuid}${publishId ? ` (publish ${publishId})` : ''}`
);

const { raw, source } = await loadRaw();
const content = buildContent(raw);
const lines = content.redirects
	.filter((r) => r.from.startsWith('/') && r.to.startsWith('/') && r.from !== r.to)
	.map((r) => `${r.from} ${r.to} ${r.status}`);
writeFileSync(path.join(APP_DIR, '_redirects'), lines.join('\n') + (lines.length ? '\n' : ''));
console.log(`[build-files] _redirects: ${lines.length} rules from ${source}`);
