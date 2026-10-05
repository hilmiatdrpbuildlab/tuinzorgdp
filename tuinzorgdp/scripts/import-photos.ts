/**
 * Uploads the 45 client photos from ../assets (the originals, not the 1200 px copies in the design
 * system) to the media bucket, with the Dutch alt text and categories from credits.json, then links
 * them to the content and creates one draft project per photo group for the client to complete.
 * Each photo is scaled to 2400 px and re-encoded as JPEG 85 (EXIF and GPS removed), as the CMS does.
 * Idempotent: photos already in the media table are skipped.
 *
 *   npm run import:photos    STORAGE_* + DATABASE_URL, or .local/storage + local PGlite without them
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { seedMedia } from '../src/lib/server/seed-data';
import { fileStorage, s3Storage, type Storage } from '../src/lib/server/storage-core';
import { openDb, schema } from './lib/db';
import { APP_DIR, REPO_DIR, env } from './lib/env';
import { linkSeedMedia } from './lib/link-media';

const { db, close, local } = await openDb(env('DATABASE_URL'));

let store: Storage;
const endpoint = env('STORAGE_ENDPOINT');
if (endpoint) {
	store = s3Storage({
		endpoint,
		bucket: env('STORAGE_BUCKET') ?? 'media',
		accessKeyId: env('STORAGE_ACCESS_KEY_ID') ?? '',
		secretAccessKey: env('STORAGE_SECRET_ACCESS_KEY') ?? '',
		region: env('STORAGE_REGION')
	});
} else {
	store = await fileStorage(path.join(APP_DIR, '.local/storage'));
}
console.log(
	`[import-photos] ${local ? 'local PGlite' : 'Neon'}, ${endpoint ? 'bucket' : '.local/storage'}`
);

const existing = new Set(
	(await db.select({ id: schema.media.id }).from(schema.media)).map((m) => m.id)
);
let uploaded = 0;
for (const m of seedMedia) {
	if (existing.has(m.id)) continue;
	const original = path.join(REPO_DIR, m.original_path);
	const source = existsSync(original)
		? original
		: path.join(REPO_DIR, 'design-system', m.source_path);
	const { data, info } = await sharp(readFileSync(source))
		.rotate()
		.resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
		.jpeg({ quality: 85, mozjpeg: true })
		.toBuffer({ resolveWithObject: true });
	const key = `originals/${m.id}.jpg`;
	await store.put(key, data, 'image/jpeg');
	await db.insert(schema.media).values({
		id: m.id,
		object_key: key,
		file_name: m.file_name,
		mime: 'image/jpeg',
		bytes: data.byteLength,
		width: info.width,
		height: info.height,
		alt: m.alt,
		focal_y: m.focal_y ?? 0.5
	});
	uploaded++;
	process.stdout.write('.');
}
if (uploaded) process.stdout.write('\n');

const linked = await linkSeedMedia(db);
console.log(
	`[import-photos] ${uploaded} photos uploaded, ${seedMedia.length - uploaded} already present, ${linked} links set`
);
await close();
