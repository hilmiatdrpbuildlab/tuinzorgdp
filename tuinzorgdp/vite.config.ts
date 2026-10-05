/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Build-time code (prerender, content reads) uses process.env; load .env into it for local builds.
	const fileEnv = loadEnv(mode, process.cwd(), '');
	for (const [key, value] of Object.entries(fileEnv)) {
		if (process.env[key] === undefined) process.env[key] = value;
	}

	return {
		plugins: [sveltekit()],
		server: {
			fs: { allow: ['..'] }
		},
		test: {
			expect: { requireAssertions: true },
			include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.{test,spec}.ts'],
			environment: 'node'
		}
	};
});
