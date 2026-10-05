/** Full-page screenshots of built pages at 1440, 768 and 390 px: npm run screenshot -- / /diensten */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { APP_DIR } from './lib/env';
import { serveStatic } from './lib/static-server';

const paths = process.argv.slice(2).filter((a) => a.startsWith('/'));
const out = process.env.SCREENSHOT_DIR ?? path.join(APP_DIR, 'test-results/screenshots');
mkdirSync(out, { recursive: true });
const server = await serveStatic(path.join(APP_DIR, '.svelte-kit/cloudflare'), 4321);
const browser = await chromium.launch();
for (const width of [1440, 768, 390]) {
	const page = await browser.newPage({ viewport: { width, height: 900 } });
	for (const p of paths.length ? paths : ['/']) {
		await page.goto(`http://localhost:4321${p}`, { waitUntil: 'networkidle' });
		// Scroll through the page so lazy images load before the full-page capture.
		await page.evaluate(async () => {
			for (let y = 0; y < document.body.scrollHeight; y += 600) {
				window.scrollTo(0, y);
				await new Promise((r) => setTimeout(r, 60));
			}
			window.scrollTo(0, 0);
		});
		await page.waitForLoadState('networkidle');
		const name = (p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')) + `-${width}.png`;
		await page.screenshot({ path: path.join(out, name), fullPage: true });
		console.log(path.join(out, name));
	}
	await page.close();
}
await browser.close();
server.close();
