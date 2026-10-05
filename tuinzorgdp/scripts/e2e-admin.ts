/**
 * End-to-end run of the CMS and the forms (docs/cms-plan/11-testing-and-handover.md).
 * Locally it starts `vite dev` itself (local PGlite, .local/storage, mails in the terminal) with an
 * unlock key, and reads the login code from the dev server's output. Uses throwaway rows only.
 *
 *   ADMIN_EMAIL=dev@tuinzorgdp.be ADMIN_PASSWORD=... npm run e2e:admin
 *   E2E_BASE_URL=https://<preview> E2E_UNLOCK_KEY=... E2E_CODE_CMD=... for a deployed preview (code read by hand)
 */
import { chromium, expect, type Page } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { APP_DIR, env, requireEnv } from './lib/env';

const email = requireEnv('ADMIN_EMAIL');
const password = requireEnv('ADMIN_PASSWORD');
const unlock = env('E2E_UNLOCK_KEY') ?? 'e2e-unlock-key-0123456789abcdefghijkl';
const base = env('E2E_BASE_URL') ?? 'http://localhost:5199';
const photo = path.join(APP_DIR, '../design-system/assets/photos/client/haag-oprit.jpg');

let output = '';
let server: ReturnType<typeof spawn> | null = null;
if (!env('E2E_BASE_URL')) {
	server = spawn('npx', ['vite', 'dev', '--port', '5199', '--strictPort'], {
		cwd: APP_DIR,
		shell: true,
		env: {
			...process.env,
			ADMIN_UNLOCK_KEY: unlock,
			DATABASE_URL: '',
			PUBLIC_SITE_URL: base,
			BREVO_API_KEY: ''
		}
	});
	server.stdout?.on('data', (d) => (output += d.toString()));
	server.stderr?.on('data', (d) => (output += d.toString()));
	for (let i = 0; i < 360 && !/ready in|Local:/.test(output); i++)
		await new Promise((r) => setTimeout(r, 500));
	// Warm up: the first requests compile the routes and open PGlite.
	for (const p of ['/', '/contact', '/admin'])
		await fetch(base + p, { signal: AbortSignal.timeout(180_000) }).catch(() => {});
}

const steps: string[] = [];
const runTitle = `E2E haag ${Date.now().toString(36)}`;
const ready = (p: Page) =>
	p.waitForSelector('html[data-ready]', { state: 'attached', timeout: 90_000 });
const step = async (name: string, fn: () => Promise<void>) => {
	await fn();
	steps.push(name);
	console.log(`ok  ${name}`);
};

async function latestCode(after: number): Promise<string> {
	for (let i = 0; i < 40; i++) {
		const matches = [...output.slice(after).matchAll(/Uw inlogcode voor TuinZorg DP: (\d{6})/g)];
		if (matches.length) return matches[matches.length - 1][1];
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error('no login code in the dev server output');
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page: Page = await ctx.newPage();
page.setDefaultNavigationTimeout(90_000);
let failed = false;
if (process.env.E2E_DEBUG) {
	page.on(
		'console',
		(m) => m.type() === 'error' && console.log('  console', m.text().slice(0, 300))
	);
	page.on('pageerror', (e) => console.log('  pageerror', e.message.slice(0, 300)));
	page.on('response', async (r) => {
		if (r.request().method() === 'POST')
			console.log('  POST', r.url(), r.status(), (await r.text().catch(() => '')).slice(0, 300));
	});
}
try {
	await step('anonymous /admin is a bare 404', async () => {
		const res = await page.goto(`${base}/admin`);
		expect(res?.status()).toBe(404);
		expect(await page.content()).not.toContain('TuinZorg');
	});

	await step('unlock link opens the login', async () => {
		await page.goto(`${base}/admin/unlock?k=${unlock}`);
		await ready(page);
		await expect(page).toHaveURL(/\/admin\/login$/);
	});

	await step('wrong password is refused', async () => {
		await page.fill('#email', email);
		await page.fill('#password', 'not-the-password');
		await page.click('button[type=submit]');
		await expect(page.locator('.tz-alert--danger')).toContainText('klopt niet');
	});

	await step('password, then a wrong code is refused, then the right code signs in', async () => {
		const mark = output.length;
		await page.fill('#password', password);
		await page.click('button[type=submit]');
		await expect(page).toHaveURL(/\/admin\/login\/code$/);
		const code = await latestCode(mark);
		await page.fill('#code', code === '000000' ? '111111' : '000000');
		await page.click('form[action="?/verify"] button[type=submit]');
		await expect(page.locator('.tz-alert--danger')).toContainText('code');
		await page.fill('#code', code);
		await page.click('form[action="?/verify"] button[type=submit]');
		await expect(page).toHaveURL(/\/admin$/);
		await expect(page.locator('h1')).toHaveText('Overzicht');
	});

	await step('edit a service and save; the banner counts the change', async () => {
		await page.goto(`${base}/admin/diensten`);
		await ready(page);
		await page.locator('.adm-row a', { hasText: 'Snoeien' }).click();
		await page.fill('#f-sub', 'Hagen, struiken en bomen (e2e)');
		await page.click('button[formaction="?/save"]');
		await expect(page.locator('.tz-toast')).toContainText('Opgeslagen');
		await expect(page.locator('.adm-publish')).toContainText('nog niet online');
	});

	await step('preview renders the draft with the public components', async () => {
		const res = await page.goto(`${base}/admin/preview/diensten/snoeien`);
		await ready(page);
		expect(res?.status()).toBe(200);
		await expect(page.locator('.tz-hero--split')).toContainText('(e2e)');
		await page.goto(`${base}/admin/diensten`);
		await ready(page);
		await page.locator('.adm-row a', { hasText: 'Snoeien' }).click();
		await page.fill('#f-sub', 'Hagen, struiken en bomen');
		await page.click('button[formaction="?/save"]');
		await expect(page.locator('.tz-toast').last()).toContainText('Opgeslagen');
	});

	let projectUrl = '';
	await step(
		'create a realisatie, upload a photo; the publishing guard blocks without alt text',
		async () => {
			await page.goto(`${base}/admin/realisaties`);
			await ready(page);
			await page.click('text=Nieuwe realisatie');
			await page.fill('#n-title', runTitle);
			await page.click('dialog button[type=submit]');
			await expect(page).toHaveURL(/\/admin\/realisaties\/[0-9a-f-]{36}$/);
			projectUrl = page.url();
			await ready(page);
			await page.click("text=Foto's opladen");
			await page.setInputFiles('dialog[open] input[type=file]', photo);
			await page.click('dialog[open] button:has-text("Opladen")');
			await expect(page.locator('.adm-gallery__row')).toHaveCount(1);
			await page.check('input[name=is_published]');
			await page.click('button[formaction="?/save"]');
			await expect(page.locator('.tz-alert--warning').first()).toContainText('omslagfoto');
		}
	);

	await step('with alt text and a cover the realisatie saves as published', async () => {
		await page.fill('.adm-gallery__row input.tz-input', 'Strak gesnoeide haag langs een oprit');
		await page.locator('.adm-gallery__row select').selectOption('after');
		await page.click('text=Kiezen');
		await page.locator('dialog[open] .adm-picker__item').first().click();
		await page.click('dialog[open] button:has-text("Kiezen")');
		await page.click('button[formaction="?/save"]');
		await expect(page.locator('.tz-toast').last()).toContainText('Opgeslagen');
	});

	await step('delete asks first, naming the item', async () => {
		await page.goto(projectUrl);
		await ready(page);
		await page.click('button:has-text("Verwijderen")');
		await expect(page.locator('dialog[open] h2')).toContainText(runTitle);
		await page.click('dialog[open] button[data-confirm]');
		await expect(page).toHaveURL(/\/admin\/realisaties$/);
		await expect(page.locator('.adm-row', { hasText: runTitle })).toHaveCount(0);
	});

	await step('Publiceren without a deploy hook reports Mislukt, never a false Live', async () => {
		await page.goto(`${base}/admin`);
		await ready(page);
		await page.click('.adm-publish button');
		await expect(page.locator('.adm-publish')).toContainText('Mislukt');
	});

	await step('a quote with three photos reaches the inbox, with the photos', async () => {
		const visitor = await ctx.newPage();
		await visitor.goto(`${base}/contact`);
		await ready(visitor);
		await visitor.locator('.tz-tile', { hasText: 'Snoeien' }).click();
		await visitor.fill('#q-voornaam', 'Eva');
		await visitor.fill('#q-naam', 'Test');
		await visitor.fill('#q-tel', '0470 12 34 56');
		await visitor.fill('#q-mail', 'eva@voorbeeld.be');
		await visitor.fill('#q-adres', 'Dorpstraat 1');
		await visitor.fill('#q-pc', '2500');
		await visitor.fill('#q-gem', 'Lier');
		await visitor.setInputFiles('#panel-offerte input[type=file]', [photo, photo, photo]);
		await visitor.fill('#q-msg', 'Graag een prijs voor de haag. (e2e)');
		await visitor.check('#panel-offerte input[name=privacy]');
		await visitor.click('#panel-offerte button[type=submit]');
		await expect(visitor.locator('.tz-contact__success')).toContainText('Bedankt');
		await page.goto(`${base}/admin/aanvragen`);
		await ready(page);
		await page.locator('.adm-row a', { hasText: 'Eva Test' }).first().click();
		await expect(page.locator('.adm-photos img')).toHaveCount(3);
		const src = await page.locator('.adm-photos img').first().getAttribute('src');
		const ok = await page.evaluate(async (u) => (await fetch(u!)).status, src);
		expect(ok).toBe(200);
		await page.click('button:has-text("Verwijderen")');
		await page.click('dialog[open] button[data-confirm]');
		await expect(page).toHaveURL(/\/admin\/aanvragen$/);
	});

	await step('the form shows the first error and focuses it', async () => {
		const visitor = await ctx.newPage();
		await visitor.goto(`${base}/contact`);
		await ready(visitor);
		await visitor.click('#panel-offerte button[type=submit]');
		await expect(visitor.locator('#panel-offerte .tz-msg--error').first()).toContainText(
			'Kies minstens één dienst'
		);
		expect(
			await visitor.evaluate(() => (document.activeElement as HTMLInputElement | null)?.name)
		).toBe('diensten');
	});
} catch (e) {
	failed = true;
	console.error(
		`FAIL after: ${steps[steps.length - 1] ?? 'start'}\n`,
		String((e as Error).message ?? e)
			.split('\n')
			.slice(0, 14)
			.join('\n')
	);
	if (process.env.E2E_DEBUG) console.error(output.slice(-5000));
	await page
		.screenshot({ path: path.join(APP_DIR, 'test-results/e2e-failure.png'), fullPage: true })
		.catch(() => {});
} finally {
	await browser.close();
	if (server) {
		if (process.platform === 'win32' && server.pid)
			spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F']);
		else server.kill();
	}
}
console.log(`${steps.length} steps passed${failed ? ', then a failure' : ''}`);
process.exit(failed ? 1 : 0);
