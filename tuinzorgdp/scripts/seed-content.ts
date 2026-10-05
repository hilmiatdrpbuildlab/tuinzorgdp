/**
 * Writes the launch content: settings, the fixed pages, the seven services, the FAQ and the
 * WordPress redirects. Idempotent: rows that exist are left alone (the client may have edited them),
 * unless --force is given. Photos and the draft projects come from scripts/import-photos.ts.
 *
 *   npm run seed:content            uses DATABASE_URL, or the local PGlite database without it
 *   npm run seed:content -- --force overwrite existing rows with the seed
 */
import {
	seedFaqs,
	seedPages,
	seedRedirects,
	seedServices,
	seedSettings
} from '../src/lib/server/seed-data';
import { openDb, schema } from './lib/db';
import { env } from './lib/env';
import { linkSeedMedia } from './lib/link-media';

const force = process.argv.includes('--force');
const { db, close, local } = await openDb(env('DATABASE_URL'));
console.log(`[seed-content] ${local ? 'local PGlite' : 'Neon'}${force ? ', --force' : ''}`);

let written = 0;
async function upsert<T extends { id: string | boolean }>(
	table: Parameters<typeof db.insert>[0],
	row: T
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic over the content tables
	const t = table as any;
	const q = db.insert(t).values(row);
	const res = force
		? await q.onConflictDoUpdate({ target: t.id, set: row }).returning()
		: await q.onConflictDoNothing().returning();
	written += res.length;
}

await upsert(schema.settings, { id: true, ...seedSettings });
for (const p of seedPages) {
	const { hero: _hero, ...row } = p;
	void _hero;
	await upsert(schema.pages, { ...row, blocks: row.blocks as Record<string, unknown> });
}
for (const s of seedServices) {
	const { cover: _cover, ...row } = s;
	void _cover;
	await upsert(schema.services, row);
}
for (const f of seedFaqs) {
	await upsert(schema.faqs, {
		id: f.id,
		question: f.question,
		answer: f.answer,
		service_id: f.service_id,
		show_on_home: f.show_on_home,
		sort_order: f.sort_order,
		is_published: f.is_published
	});
}
for (const r of seedRedirects) await upsert(schema.redirects, r);

// Covers, hero and about photos, for the photos that have been imported already.
const linked = await linkSeedMedia(db, force);

console.log(`[seed-content] ${written} rows written, ${linked} photo links set`);
await close();
