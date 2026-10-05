/**
 * After vite build: fails the build when the output breaks a rule (docs/cms-plan/11-testing-and-handover.md).
 * Every route exists; titles ≤ 62 and descriptions ≤ 158; JSON-LD parses with the expected types;
 * the NAP is identical on every page; the sitemap lists every published slug; no unpublished slug
 * appears; no request data or secret is in the output; every <img> has width, height and alt;
 * no image is wider than 2400 px; the home masonry staggers; every redirect is a 301/302 rule.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { LIMITS } from '../src/lib/rules';
import { buildContent, loadRaw } from './lib/content';
import { APP_DIR, env } from './lib/env';

const OUT = path.join(APP_DIR, '.svelte-kit/cloudflare');
const problems: string[] = [];
const fail = (msg: string) => problems.push(msg);

const { raw, source } = await loadRaw();
const content = buildContent(raw);

const htmlFor = (route: string) => {
	const file =
		route === '/' ? path.join(OUT, 'index.html') : path.join(OUT, `${route.slice(1)}.html`);
	return existsSync(file) ? readFileSync(file, 'utf8') : null;
};

// 1. Every route exists, with the JSON-LD types it should carry.
type Expect = { route: string; types: string[] };
const expected: Expect[] = [
	{ route: '/', types: ['LandscapingBusiness'] },
	{ route: '/diensten', types: ['LandscapingBusiness', 'BreadcrumbList'] },
	...content.services.map((s) => ({
		route: `/diensten/${s.slug}`,
		types: ['LandscapingBusiness', 'Service', 'BreadcrumbList']
	})),
	{ route: '/realisaties', types: ['LandscapingBusiness', 'BreadcrumbList'] },
	...content.projects.map((p) => ({
		route: `/realisaties/${p.slug}`,
		types: ['LandscapingBusiness', 'ImageGallery', 'BreadcrumbList']
	})),
	...content.areas.map((a) => ({
		route: `/tuinonderhoud/${a.slug}`,
		types: ['LandscapingBusiness', 'BreadcrumbList']
	})),
	{ route: '/contact', types: ['LandscapingBusiness', 'BreadcrumbList'] },
	{ route: '/privacy', types: ['LandscapingBusiness'] },
	{ route: '/bedankt', types: [] },
	{ route: '/formulier-fout', types: [] },
	{ route: '/404', types: [] }
];
if (content.faqs.some((f) => f.showOnHome)) expected[0].types.push('FAQPage');

const naps = new Map<string, string>();
const pages = new Map<string, string>();
for (const e of expected) {
	const html = htmlFor(e.route);
	if (!html) {
		fail(`missing page ${e.route}`);
		continue;
	}
	pages.set(e.route, html);
	const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
	const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
	const decode = (s: string) =>
		s
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>');
	if (!title) fail(`${e.route}: no <title>`);
	if (decode(title).length > LIMITS.seoTitle)
		fail(`${e.route}: title is ${decode(title).length} characters (max ${LIMITS.seoTitle})`);
	if (!desc && !['/bedankt', '/formulier-fout', '/404'].includes(e.route))
		fail(`${e.route}: no meta description`);
	if (decode(desc).length > LIMITS.metaDescription)
		fail(
			`${e.route}: description is ${decode(desc).length} characters (max ${LIMITS.metaDescription})`
		);
	if (!/<link rel="canonical" href="[^"]+"/.test(html)) fail(`${e.route}: no canonical link`);

	const types: string[] = [];
	for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
		try {
			const data = JSON.parse(m[1]);
			types.push(data['@type']);
			if (data['@type'] === 'LandscapingBusiness')
				naps.set(e.route, JSON.stringify({ n: data.name, a: data.address, t: data.telephone }));
		} catch {
			fail(`${e.route}: JSON-LD does not parse`);
		}
	}
	for (const t of e.types) if (!types.includes(t)) fail(`${e.route}: JSON-LD ${t} missing`);

	const footerNap = /<address data-nap[^>]*>([\s\S]*?)<\/address>/
		.exec(html)?.[1]
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\s+/g, ' ');
	if (footerNap) naps.set(`${e.route}#footer`, footerNap);

	// Every image: width, height and alt.
	for (const img of html.matchAll(/<img\b[^>]*>/g)) {
		const tag = img[0];
		if (!/\swidth=/.test(tag) || !/\sheight=/.test(tag))
			fail(`${e.route}: <img> without width/height: ${tag.slice(0, 90)}`);
		if (!/\salt=/.test(tag)) fail(`${e.route}: <img> without alt: ${tag.slice(0, 90)}`);
	}
}

// 2. The NAP is identical on every page (JSON-LD and the footer address).
const jsonNaps = new Set([...naps].filter(([k]) => !k.endsWith('#footer')).map(([, v]) => v));
const footerNaps = new Set([...naps].filter(([k]) => k.endsWith('#footer')).map(([, v]) => v));
if (jsonNaps.size > 1) fail('the JSON-LD NAP differs between pages');
if (footerNaps.size > 1) fail('the footer address differs between pages');
const phone = content.settings.company.phone;
if (phone)
	for (const [route, html] of pages)
		if (!['/bedankt', '/formulier-fout', '/404'].includes(route) && !html.includes(phone))
			fail(`${route}: phone ${phone} not on the page`);

// 3. Sitemap lists every published slug; robots.txt matches the environment.
const sitemap = existsSync(path.join(OUT, 'sitemap.xml'))
	? readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8')
	: '';
if (!sitemap) fail('sitemap.xml missing');
for (const e of expected.filter(
	(x) => !['/bedankt', '/formulier-fout', '/404'].includes(x.route)
)) {
	if (e.route === '/privacy' && content.pages.privacy?.noindex) continue;
	if (!sitemap.includes(`${e.route === '/' ? '/' : e.route}</loc>`))
		fail(`sitemap misses ${e.route}`);
}
const robots = existsSync(path.join(OUT, 'robots.txt'))
	? readFileSync(path.join(OUT, 'robots.txt'), 'utf8')
	: '';
const indexable =
	env('SITE_INDEXABLE') === 'true' &&
	!/workers\.dev|localhost/.test(env('PUBLIC_SITE_URL') ?? 'localhost');
if (!indexable && !/Disallow: \/\s*$/m.test(robots))
	fail('robots.txt must block all crawlers on the test site');

// 4. No unpublished row appears anywhere.
const allHtml = [...walk(OUT)]
	.filter((f) => f.endsWith('.html'))
	.map((f) => readFileSync(f, 'utf8'))
	.join('\n');
const publishedProjects = new Set(content.projects.map((p) => p.slug));
for (const p of raw.projects)
	if (!publishedProjects.has(p.slug) && allHtml.includes(`/realisaties/${p.slug}"`))
		fail(`unpublished project ${p.slug} is linked`);
const publishedServices = new Set(content.services.map((s) => s.slug));
for (const s of raw.services)
	if (!publishedServices.has(s.slug) && allHtml.includes(`/diensten/${s.slug}"`))
		fail(`hidden service ${s.slug} is linked`);
const publishedAreas = new Set(content.areas.map((a) => a.slug));
for (const a of raw.areas)
	if (!publishedAreas.has(a.slug) && allHtml.includes(`/tuinonderhoud/${a.slug}"`))
		fail(`unpublished area ${a.slug} is linked`);
for (const r of raw.reviews)
	if (
		!(r.is_published && r.consent_confirmed) &&
		r.quote.length > 20 &&
		allHtml.includes(r.quote.slice(0, 40))
	)
		fail('an unpublished review appears');

// 5. No request data or secret in the output (client bundle included).
const allText = [...walk(OUT)]
	.filter(
		(f) =>
			/\.(html|js|json|css|txt|xml)$/.test(f) &&
			!f.endsWith('_sveltekit_worker.js') &&
			!f.includes(`${path.sep}output${path.sep}`)
	)
	.map((f) => readFileSync(f, 'utf8'))
	.join('\n');
if (/requests\/[0-9a-f-]{36}\//.test(allText)) fail('a request photo key appears in the output');
for (const name of [
	'DATABASE_URL',
	'DATABASE_URL_BUILD',
	'STORAGE_SECRET_ACCESS_KEY',
	'STORAGE_READ_SECRET',
	'BETTER_AUTH_SECRET',
	'ADMIN_UNLOCK_KEY',
	'BREVO_API_KEY',
	'DEPLOY_HOOK_URL',
	'TURNSTILE_SECRET',
	'GOOGLE_PLACES_KEY',
	'CRON_SECRET'
]) {
	const v = env(name);
	if (v && v.length >= 8 && clientFiles().some((t) => t.includes(v)))
		fail(`the value of ${name} appears in the client output`);
}

// 6. Images: no variant wider than 2400 px.
const mediaDir = path.join(OUT, 'media');
if (existsSync(mediaDir))
	for (const f of readdirSync(mediaDir)) {
		const w = Number(/-(\d+)\.webp$/.exec(f)?.[1] ?? 0);
		if (w > 2400) fail(`image ${f} is wider than 2400 px`);
	}

// 7. The home masonry staggers (at least two tile ratios).
const home = pages.get('/') ?? '';
const galleryHtml = /<div class="tz-gallery"[\s\S]*?<dialog/.exec(home)?.[0] ?? '';
const ratios = new Set([...galleryHtml.matchAll(/tz-media--(\dx\d)/g)].map((m) => m[1]));
if (content.gallery.some((g) => g.inHome) && ratios.size < 2)
	fail('the home gallery does not stagger (fewer than two ratios)');

// 8. Redirects.
const redirects = existsSync(path.join(OUT, '_redirects'))
	? readFileSync(path.join(OUT, '_redirects'), 'utf8')
	: '';
for (const r of content.redirects)
	if (!redirects.split('\n').includes(`${r.from} ${r.to} ${r.status}`))
		fail(`redirect ${r.from} missing from _redirects`);

function* walk(dir: string): Generator<string> {
	for (const name of readdirSync(dir)) {
		const p = path.join(dir, name);
		if (statSync(p).isDirectory()) yield* walk(p);
		else yield p;
	}
}
function clientFiles() {
	return [...walk(path.join(OUT, '_app'))]
		.filter((f) => f.endsWith('.js'))
		.map((f) => readFileSync(f, 'utf8'))
		.concat(allHtml);
}

if (problems.length) {
	console.error(
		`[verify-build] ${problems.length} problem(s) (${source} content):\n  - ${problems.join('\n  - ')}`
	);
	process.exit(1);
}
console.log(`[verify-build] ${pages.size} pages checked (${source} content): all rules pass`);
