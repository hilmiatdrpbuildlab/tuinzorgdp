/** Loads .env (and .dev.vars) for the scripts, without overriding variables already set (CI, Workers Builds). */
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const REPO_DIR = path.resolve(APP_DIR, '..');

for (const file of ['.env', '.dev.vars']) {
	const p = path.join(APP_DIR, file);
	if (existsSync(p)) config({ path: p, override: false, quiet: true });
}

export function env(name: string): string | undefined {
	const v = process.env[name];
	return v === '' ? undefined : v;
}

export function requireEnv(name: string): string {
	const v = env(name);
	if (!v) {
		console.error(`${name} is not set.`);
		process.exit(1);
	}
	return v;
}
