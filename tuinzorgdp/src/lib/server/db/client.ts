/**
 * Database access. Production and previews use Neon: a WebSocket pool per request at run time
 * (transactions for the CMS saves) and the stateless HTTP driver for build-time reads.
 * `vite dev` without a DATABASE_URL uses PGlite in .local/pglite, so the CMS runs without a Neon account.
 */
import { dev } from '$app/environment';
import { Pool, neon } from '@neondatabase/serverless';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the drivers differ only in their result type
export type Db = PgDatabase<any, typeof schema>;

let devDb: Promise<Db> | null = null;

async function localDb(): Promise<Db> {
	if (!devDb) {
		devDb = (async () => {
			const { createLocalDb } = await import('./local');
			return createLocalDb();
		})();
	}
	return devDb;
}

/** Run-time connection for a Worker request. Call `close` (via waitUntil) when the response is sent. */
export async function connect(
	url: string | undefined
): Promise<{ db: Db; close: () => Promise<void> }> {
	if (!url) {
		if (dev) return { db: await localDb(), close: async () => {} };
		throw new Error('DATABASE_URL is not set');
	}
	const pool = new Pool({ connectionString: url });
	return { db: drizzlePool(pool, { schema }) as unknown as Db, close: () => pool.end() };
}

/** Build-time, read-only connection (the tz_build role). */
export function connectHttp(url: string): Db {
	return drizzleHttp(neon(url), { schema }) as unknown as Db;
}

export { schema };
