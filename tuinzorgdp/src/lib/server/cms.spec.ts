import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { deleteIfUnused, recordSlugChange, sweepUnusedMedia, syncUsages } from './cms';
import type { Db } from './db/client';
import * as schema from './db/schema';
import { memoryDb, memoryStorage } from './test-utils';

let db: Db;
let store: ReturnType<typeof memoryStorage>;

async function addMedia(key: string, updated = new Date()) {
	await store.put(key, new Uint8Array([1]), 'image/jpeg');
	const [m] = await db
		.insert(schema.media)
		.values({
			object_key: key,
			file_name: 'x.jpg',
			mime: 'image/jpeg',
			bytes: 1,
			width: 10,
			height: 10,
			updated_at: updated
		})
		.returning();
	return m.id;
}

beforeEach(async () => {
	db = await memoryDb();
	store = memoryStorage();
});

describe('media usages and the cost rule', () => {
	it('replacing a photo deletes the old one when nothing else uses it', async () => {
		const a = await addMedia('originals/a.jpg');
		const b = await addMedia('originals/b.jpg');
		await syncUsages(db, 'services', 's1', [{ field: 'cover', mediaId: a }]);
		const dropped = await syncUsages(db, 'services', 's1', [{ field: 'cover', mediaId: b }]);
		expect(dropped).toEqual([a]);
		expect(await deleteIfUnused(db, store, dropped)).toBe(1);
		expect(store.files.has('originals/a.jpg')).toBe(false);
		expect(await db.select().from(schema.media).where(eq(schema.media.id, a))).toHaveLength(0);
		expect(store.files.has('originals/b.jpg')).toBe(true);
	});

	it('keeps a file that another row still uses', async () => {
		const a = await addMedia('originals/a.jpg');
		await syncUsages(db, 'services', 's1', [{ field: 'cover', mediaId: a }]);
		await syncUsages(db, 'projects', 'p1', [{ field: 'photos', mediaId: a }]);
		const dropped = await syncUsages(db, 'services', 's1', []);
		expect(await deleteIfUnused(db, store, dropped)).toBe(0);
		expect(store.files.has('originals/a.jpg')).toBe(true);
	});

	it('the daily sweep removes uploads unused for more than 24 hours, and only those', async () => {
		const old = await addMedia('originals/old.jpg', new Date(Date.now() - 25 * 3600_000));
		const fresh = await addMedia('originals/fresh.jpg');
		const usedOld = await addMedia('originals/used.jpg', new Date(Date.now() - 48 * 3600_000));
		await syncUsages(db, 'pages', 'home', [{ field: 'hero', mediaId: usedOld }]);
		expect(await sweepUnusedMedia(db, store)).toBe(1);
		const left = (await db.select({ id: schema.media.id }).from(schema.media)).map((m) => m.id);
		expect(left).not.toContain(old);
		expect(left).toEqual(expect.arrayContaining([fresh, usedOld]));
	});
});

describe('slug changes', () => {
	it('write a redirect and repoint older redirects', async () => {
		await db
			.insert(schema.redirects)
			.values({ from_path: '/ons-werk', to_path: '/realisaties/oud' });
		await recordSlugChange(db, '/realisaties', 'oud', 'nieuw');
		const rows = await db.select().from(schema.redirects);
		expect(rows.find((r) => r.from_path === '/realisaties/oud')?.to_path).toBe(
			'/realisaties/nieuw'
		);
		expect(rows.find((r) => r.from_path === '/ons-werk')?.to_path).toBe('/realisaties/nieuw');
	});
});
