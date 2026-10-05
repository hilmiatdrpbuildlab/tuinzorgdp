/**
 * After `wrangler deploy`: marks this build live in the builds table, and any older pending ones it
 * superseded. A code push without a publish adds a row with trigger `push`.
 */
import { and, eq, inArray, lte } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { openHttp, schema } from './lib/db';
import { APP_DIR, env } from './lib/env';

const url = env('DATABASE_URL_BUILD');
if (!url) {
	console.log('[mark-live] no DATABASE_URL_BUILD; nothing to mark');
	process.exit(0);
}
const info = JSON.parse(readFileSync(path.join(APP_DIR, 'static/build-info.json'), 'utf8')) as {
	buildId: string;
	publishId: string | null;
};
const db = openHttp(url);
const now = new Date();

if (info.publishId) {
	const [row] = await db.select().from(schema.builds).where(eq(schema.builds.id, info.publishId));
	if (row) {
		await db
			.update(schema.builds)
			.set({ status: 'live', finished_at: now, build_uuid: info.buildId })
			.where(
				and(
					inArray(schema.builds.status, ['pending', 'building']),
					lte(schema.builds.triggered_at, row.triggered_at)
				)
			);
	}
} else {
	await db
		.insert(schema.builds)
		.values({ trigger: 'push', status: 'live', finished_at: now, build_uuid: info.buildId });
}
console.log(
	`[mark-live] ${info.buildId} is live${info.publishId ? ` (publish ${info.publishId})` : ''}`
);
