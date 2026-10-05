/**
 * CMS uploads (docs/cms-plan/04-media.md): the browser has already scaled the photo to 2400 px and
 * re-encoded it as JPEG. Here the type is sniffed from the bytes, the size checked, and the file
 * stored at originals/<uuid>.<ext> with its dimensions read from the image itself.
 */
import { sniffImage } from '$lib/forms';
import { LIMITS } from '$lib/rules';
import type { Db } from './db/client';
import * as schema from './db/schema';
import type { Storage } from './storage-core';

export const UNSUPPORTED = 'Dit bestandstype wordt niet ondersteund. Kies een JPG, PNG of WebP.';

/** Width and height from the JPEG, PNG or WebP header. */
export function imageSize(b: Uint8Array): { width: number; height: number } | null {
	const mime = sniffImage(b);
	if (mime === 'image/png') {
		const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
		return { width: v.getUint32(16), height: v.getUint32(20) };
	}
	if (mime === 'image/webp') {
		const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
		const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
		if (chunk === 'VP8X')
			return {
				width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
				height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16))
			};
		if (chunk === 'VP8 ')
			return { width: v.getUint16(26, true) & 0x3fff, height: v.getUint16(28, true) & 0x3fff };
		if (chunk === 'VP8L') {
			const bits = v.getUint32(21, true);
			return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
		}
		return null;
	}
	if (mime === 'image/jpeg') {
		let i = 2;
		while (i < b.length) {
			if (b[i] !== 0xff) return null;
			const marker = b[i + 1];
			const len = (b[i + 2] << 8) | b[i + 3];
			if (
				marker >= 0xc0 &&
				marker <= 0xcf &&
				marker !== 0xc4 &&
				marker !== 0xc8 &&
				marker !== 0xcc
			) {
				return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] };
			}
			i += 2 + len;
		}
	}
	return null;
}

const EXT: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

export type UploadResult =
	{ ok: true; media: typeof schema.media.$inferSelect } | { ok: false; message: string };

export async function storeUpload(
	db: Db,
	store: Storage,
	file: File,
	alt: string
): Promise<UploadResult> {
	if (file.size > LIMITS.cmsUploadBytes)
		return { ok: false, message: 'De foto is groter dan 10 MB.' };
	const bytes = new Uint8Array(await file.arrayBuffer());
	const mime = sniffImage(bytes);
	if (!mime) return { ok: false, message: UNSUPPORTED };
	const size = imageSize(bytes);
	if (!size || !size.width || !size.height)
		return { ok: false, message: 'De afmetingen van de foto konden niet gelezen worden.' };
	if (Math.max(size.width, size.height) > 4000)
		return { ok: false, message: 'De foto is te groot. Laad hem opnieuw op.' };
	const id = crypto.randomUUID();
	const key = `originals/${id}.${EXT[mime]}`;
	await store.put(key, bytes, mime);
	const [media] = await db
		.insert(schema.media)
		.values({
			id,
			object_key: key,
			file_name: (file.name || `foto.${EXT[mime]}`).slice(0, 200),
			mime,
			bytes: bytes.byteLength,
			width: size.width,
			height: size.height,
			alt: alt.trim().slice(0, 300)
		})
		.returning();
	return { ok: true, media };
}
