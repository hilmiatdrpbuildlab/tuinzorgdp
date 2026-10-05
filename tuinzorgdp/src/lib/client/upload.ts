import { ACCEPTED_IMAGE_TYPES, scaleImage } from './images';

export type AdminMedia = { id: string; src: string; alt: string; width: number; height: number };

export const UNSUPPORTED = 'Dit bestandstype wordt niet ondersteund. Kies een JPG, PNG of WebP.';
const MAX_BEFORE_SCALING = 10 * 1024 * 1024;

/** Scales to 2400 px and JPEG 85 in the browser (EXIF and GPS stripped), then uploads. */
export async function uploadMedia(file: File, alt: string): Promise<AdminMedia> {
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error(UNSUPPORTED);
	if (file.size > MAX_BEFORE_SCALING)
		throw new Error('De foto is groter dan 10 MB. Kies een kleinere foto.');
	const { blob } = await scaleImage(file, 2400, 0.85);
	const fd = new FormData();
	fd.set('file', blob, file.name.replace(/\.[^.]+$/, '') + '.jpg');
	fd.set('alt', alt);
	const res = await fetch('/admin/api/media', { method: 'POST', body: fd });
	const body = (await res.json().catch(() => null)) as {
		media?: AdminMedia;
		message?: string;
	} | null;
	if (!res.ok || !body?.media)
		throw new Error(body?.message ?? 'Het opladen is mislukt. Probeer opnieuw.');
	return body.media;
}

export async function listMedia(): Promise<AdminMedia[]> {
	const res = await fetch('/admin/api/media');
	if (!res.ok) return [];
	return ((await res.json()) as { media: AdminMedia[] }).media;
}
