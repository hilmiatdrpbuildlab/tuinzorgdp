import { building } from '$app/environment';
import { env as dynamicEnv } from '$env/dynamic/private';

/**
 * Server-only configuration. At build time (prerender) values come from process.env, which
 * vite.config.ts fills from .env; at run time they come from the Worker's vars and secrets.
 * SvelteKit forbids reading $env/dynamic while prerendering, hence the split.
 */
export function env(name: string): string | undefined {
	const value = building ? process.env[name] : dynamicEnv[name];
	return value === '' ? undefined : value;
}

export function requireEnv(name: string): string {
	const value = env(name);
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

export const siteUrl = () => (env('PUBLIC_SITE_URL') ?? 'http://localhost:5173').replace(/\/$/, '');

/** True for the *.workers.dev build and previews: noindex and a blocking robots.txt until the domain move. */
export const isTestSite = () => {
	const url = siteUrl();
	return env('SITE_INDEXABLE') !== 'true' || /workers\.dev|localhost/.test(url);
};
