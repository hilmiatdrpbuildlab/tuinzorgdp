/**
 * Responsive and accessibility checks on the build output (docs/cms-plan/11-testing-and-handover.md):
 * no horizontal overflow at 320–1440 px, tap targets of at least 44 × 44 px, the header collapses
 * under 1024 px, no cookies before interaction, and no serious or critical axe-core issues.
 *
 *   npm run build && npm run responsive [-- /extra/path]
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { APP_DIR } from './lib/env';
import { serveStatic } from './lib/static-server';

const WIDTHS = [320, 375, 430, 768, 1024, 1440];
const OUT = path.join(APP_DIR, '.svelte-kit/cloudflare');
const sitemap = readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const paths = [
	...new Set(
		[...sitemap.matchAll(/<loc>[^<]*?(\/[^<]*)<\/loc>/g)].map(
			(m) => new URL(m[1], 'http://x').pathname
		)
	),
	...process.argv.slice(2).filter((a) => a.startsWith('/'))
];

const server = await serveStatic(OUT, 4322);
const browser = await chromium.launch();
const problems: string[] = [];

for (const width of WIDTHS) {
	const ctx = await browser.newContext({ viewport: { width, height: 900 } });
	const page = await ctx.newPage();
	for (const p of paths) {
		await page.goto(`http://localhost:4322${p}`, { waitUntil: 'load' });
		// The page must hydrate: the root layout sets data-ready once Svelte runs in the browser.
		const hydrated = await page
			.waitForSelector('html[data-ready]', { state: 'attached', timeout: 10_000 })
			.then(() => true)
			.catch(() => false);
		if (!hydrated) problems.push(`${p} @${width}: the page does not hydrate (JavaScript error)`);
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth
		);
		if (overflow > 1) problems.push(`${p} @${width}: horizontal overflow of ${overflow}px`);

		const small = await page.evaluate(() =>
			[
				...document.querySelectorAll<HTMLElement>(
					'a.tz-btn, button.tz-btn, .tz-tag, .tz-menu-btn, .tz-nav a, .tz-tile'
				)
			]
				.filter((el) => el.offsetParent !== null)
				.map((el) => ({
					r: el.getBoundingClientRect(),
					t: (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30)
				}))
				.filter(({ r }) => r.width > 0 && (r.width < 44 || r.height < 44))
				.map(({ t, r }) => `${t} (${Math.round(r.width)}×${Math.round(r.height)})`)
		);
		if (small.length)
			problems.push(`${p} @${width}: tap targets under 44px: ${small.slice(0, 4).join(', ')}`);

		const menuVisible = await page.locator('.tz-menu-btn').isVisible();
		if (width < 1024 && !menuVisible) problems.push(`${p} @${width}: header does not collapse`);
		if (width >= 1024 && menuVisible)
			problems.push(`${p} @${width}: menu button visible on desktop`);

		if (width === 375 || width === 1440) {
			const axe = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
				.analyze();
			for (const v of axe.violations.filter(
				(x) => x.impact === 'serious' || x.impact === 'critical'
			)) {
				problems.push(
					`${p} @${width}: axe ${v.impact} ${v.id} (${v.nodes.length}×) ${v.nodes[0]?.target.join(' ')}`
				);
			}
		}
	}
	const cookies = await ctx.cookies();
	if (cookies.length)
		problems.push(
			`@${width}: cookies set without interaction: ${cookies.map((c) => c.name).join(', ')}`
		);
	await ctx.close();
}

await browser.close();
server.close();
if (problems.length) {
	console.error(`[responsive] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
	process.exit(1);
}
console.log(
	`[responsive] ${paths.length} pages × ${WIDTHS.length} widths: no overflow, tap targets OK, header collapses, pages hydrate, no cookies, no serious axe issues`
);
