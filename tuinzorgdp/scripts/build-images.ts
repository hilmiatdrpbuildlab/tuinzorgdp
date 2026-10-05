/**
 * Before vite build: downloads every image the published site uses and writes 480, 960, 1600 and
 * 2400 px WebP variants (never wider than the original) to static/media/<id>-<width>.webp.
 * Visitors never load from the bucket. Seed photos (`ds:` keys) come from the design system.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { variantWidths } from '../src/lib/media';
import { s3Storage, type Storage } from '../src/lib/server/storage-core';
import { buildContent, loadRaw } from './lib/content';
import { APP_DIR, REPO_DIR, env } from './lib/env';

const OUT = path.join(APP_DIR, 'static/media');
mkdirSync(OUT, { recursive: true });

const { raw, source } = await loadRaw();
const content = buildContent(raw);

// Every media id the prerendered pages reference.
const used = new Set<string>();
const add = (m: { id: string } | null | undefined) => m && used.add(m.id);
for (const s of content.services) add(s.cover);
for (const p of Object.values(content.pages)) add(p.hero);
for (const m of content.home.aboutMedia) add(m);
for (const p of content.projects) {
	add(p.cover);
	for (const ph of p.photos) add(ph.media);
}
for (const g of content.gallery) add(g.media);
for (const s of content.social) add(s.media);

let bucket: Storage | null = null;
function store(): Storage {
	if (bucket) return bucket;
	const endpoint = env('STORAGE_ENDPOINT');
	const accessKeyId = env('STORAGE_READ_KEY_ID') ?? env('STORAGE_ACCESS_KEY_ID');
	const secretAccessKey = env('STORAGE_READ_SECRET') ?? env('STORAGE_SECRET_ACCESS_KEY');
	if (!endpoint || !accessKeyId || !secretAccessKey) {
		throw new Error(
			'STORAGE_ENDPOINT and a read credential (STORAGE_READ_KEY_ID, STORAGE_READ_SECRET) are needed to build images.'
		);
	}
	bucket = s3Storage({
		endpoint,
		bucket: env('STORAGE_BUCKET') ?? 'media',
		accessKeyId,
		secretAccessKey,
		region: env('STORAGE_REGION')
	});
	return bucket;
}

async function original(key: string): Promise<Buffer> {
	if (key.startsWith('ds:'))
		return readFileSync(path.join(REPO_DIR, 'design-system', key.slice(3)));
	const local = path.join(APP_DIR, '.local/storage', ...key.split('/'));
	if (!env('STORAGE_ENDPOINT') && existsSync(local)) return readFileSync(local);
	const body = await store().get(key);
	if (!body) throw new Error(`Missing in the bucket: ${key}`);
	return Buffer.from(body);
}

const wanted = new Set<string>();
let written = 0;
for (const row of raw.media) {
	if (!used.has(row.id)) continue;
	const widths = variantWidths(row.width);
	const files = widths.map((w) => `${row.id}-${w}.webp`);
	files.forEach((f) => wanted.add(f));
	if (files.every((f) => existsSync(path.join(OUT, f)))) continue;
	const input = await original(row.object_key);
	for (const w of widths) {
		const out = await sharp(input)
			.rotate()
			.resize({ width: w, withoutEnlargement: true })
			.webp({ quality: 78 })
			.toBuffer();
		writeFileSync(path.join(OUT, `${row.id}-${w}.webp`), out);
		written++;
	}
}

// Variants of photos that are no longer used leave the build output.
let removed = 0;
for (const f of readdirSync(OUT)) {
	if (!wanted.has(f)) {
		rmSync(path.join(OUT, f));
		removed++;
	}
}

console.log(
	`[build-images] ${used.size} photos in use (${source}); ${written} variants written, ${removed} removed`
);
