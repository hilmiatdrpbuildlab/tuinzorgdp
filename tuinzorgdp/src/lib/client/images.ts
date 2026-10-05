/**
 * Scales a photo in the browser and re-encodes it as JPEG, which also strips EXIF data
 * (including the GPS location of a customer's garden). Used by the quote form (2000 px, q 0.8)
 * and the CMS upload (2400 px, q 0.85).
 */
export async function scaleImage(
	file: File,
	maxSide: number,
	quality: number
): Promise<{ blob: Blob; width: number; height: number }> {
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
	const width = Math.round(bitmap.width * scale);
	const height = Math.round(bitmap.height * scale);
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas niet beschikbaar');
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();
	const blob = await new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error('Kon de foto niet verwerken'))),
			'image/jpeg',
			quality
		)
	);
	return { blob, width, height };
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
