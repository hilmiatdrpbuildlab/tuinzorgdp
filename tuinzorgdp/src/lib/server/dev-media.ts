/** Dev-only image variants (see src/routes/media/[file]). Never imported by a production build. */
import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Db } from './db/client';
import * as schema from './db/schema';
import { seedMedia } from './seed-data';
import { storage } from './storage';

export async function generateDevVariant(
	db: Db,
	id: string,
	width: number
): Promise<Uint8Array | null> {
	const sharp = (await import('sharp')).default;
	const [row] = await db.select().from(schema.media).where(eq(schema.media.id, id));
	const key =
		row?.object_key ??
		(seedMedia.find((s) => s.id === id)
			? `ds:${seedMedia.find((s) => s.id === id)!.source_path}`
			: null);
	if (!key) return null;
	const input = key.startsWith('ds:')
		? await readFile(path.resolve('..', 'design-system', key.slice(3)))
		: Buffer.from((await (await storage()).get(key)) ?? new ArrayBuffer(0));
	if (!input.length) return null;
	return new Uint8Array(
		await sharp(input)
			.rotate()
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: 78 })
			.toBuffer()
	);
}
