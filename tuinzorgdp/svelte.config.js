import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { existsSync, readFileSync } from 'node:fs';

// One version name for the whole build. It must be identical in every process vite build starts
// (client, server, prerender), so it comes from the build-info.json written before vite build.
const buildId = (() => {
	if (process.env.WORKERS_CI_BUILD_UUID) return process.env.WORKERS_CI_BUILD_UUID;
	try {
		if (existsSync('static/build-info.json'))
			return JSON.parse(readFileSync('static/build-info.json', 'utf8')).buildId;
	} catch {
		/* fall through */
	}
	return 'dev';
})();

// The storage endpoint serves the signed request-photo URLs inside /admin (see docs/cms-plan/08-security.md).
const storageOrigin = (() => {
	try {
		return process.env.STORAGE_ENDPOINT ? new URL(process.env.STORAGE_ENDPOINT).origin : null;
	} catch {
		return null;
	}
})();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({ fallback: 'plaintext' }),
		alias: {
			$components: 'src/lib/components'
		},
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': [
					'self',
					'https://challenges.cloudflare.com',
					'https://static.cloudflareinsights.com'
				],
				'frame-src': ['https://challenges.cloudflare.com', 'https://www.google.com'],
				'img-src': ['self', 'data:', 'blob:', ...(storageOrigin ? [storageOrigin] : [])],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self'],
				'connect-src': ['self', 'https://cloudflareinsights.com'],
				'form-action': ['self'],
				'base-uri': ['self'],
				'object-src': ['none']
			}
		},
		prerender: {
			entries: [
				'*',
				'/sitemap.xml',
				'/robots.txt',
				'/llms.txt',
				'/404',
				'/bedankt',
				'/formulier-fout'
			],
			handleHttpError: ({ path, message }) => {
				// Generated images and the build info are written by scripts before vite build.
				if (path.startsWith('/media/') || path === '/build-info.json') return;
				throw new Error(message);
			},
			handleMissingId: 'warn',
			// /tuinonderhoud/[gemeente] has no pages until the client publishes a werkgebied.
			handleUnseenRoutes: 'ignore'
		},
		version: {
			name: buildId
		}
	}
};

export default config;
