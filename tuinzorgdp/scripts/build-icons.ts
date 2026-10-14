/**
 * Before vite build: the raster icons search engines and phones ask for, rendered from the design
 * system mark (static/favicon.svg, copied by sync-design-system). Google Search shows a favicon
 * only when it can fetch one of at least 48 × 48 px; /favicon.ico is the address it tries first.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { APP_DIR } from './lib/env';

const STATIC = path.join(APP_DIR, 'static');
const svg = readFileSync(path.join(STATIC, 'favicon.svg'));
/** The mark's own green, behind the rounded corners where a platform does not allow transparency. */
const FOREST = '#2d5a27';

const png = (size: number, background?: string) => {
	const img = sharp(svg, { density: Math.max(72, Math.ceil((size / 64) * 72)) }).resize(size, size);
	return (background ? img.flatten({ background }) : img).png({ compressionLevel: 9 }).toBuffer();
};

/** A .ico holding PNG images (supported by every current browser and by Google). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
	const header = Buffer.alloc(6 + 16 * images.length);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);
	let offset = header.length;
	images.forEach(({ size, data }, i) => {
		const e = 6 + 16 * i;
		header.writeUInt8(size >= 256 ? 0 : size, e);
		header.writeUInt8(size >= 256 ? 0 : size, e + 1);
		header.writeUInt16LE(1, e + 4);
		header.writeUInt16LE(32, e + 6);
		header.writeUInt32LE(data.length, e + 8);
		header.writeUInt32LE(offset, e + 12);
		offset += data.length;
	});
	return Buffer.concat([header, ...images.map((x) => x.data)]);
}

const sizes = [16, 32, 48];
const icoImages = await Promise.all(sizes.map(async (size) => ({ size, data: await png(size) })));
writeFileSync(path.join(STATIC, 'favicon.ico'), ico(icoImages));
writeFileSync(path.join(STATIC, 'favicon-96.png'), await png(96));
writeFileSync(path.join(STATIC, 'icon-192.png'), await png(192));
writeFileSync(path.join(STATIC, 'icon-512.png'), await png(512));
writeFileSync(path.join(STATIC, 'apple-touch-icon.png'), await png(180, FOREST));
writeFileSync(
	path.join(STATIC, 'site.webmanifest'),
	JSON.stringify(
		{
			name: 'TuinZorg DP',
			short_name: 'TuinZorg DP',
			icons: [
				{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
				{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
			],
			theme_color: '#224620',
			background_color: '#ffffff',
			display: 'browser',
			start_url: '/'
		},
		null,
		2
	) + '\n'
);
console.log('[build-icons] favicon.ico (16, 32, 48), favicon-96, icon-192/512, apple-touch-icon');
