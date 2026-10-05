/**
 * Database connections for the scripts. A `pglite:` URL (or none, with --local) opens the local
 * PGlite database the dev server uses; stop `npm run dev` first, PGlite allows one process at a time.
 */
import { Pool, neon } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Db } from '../../src/lib/server/db/client';
import * as schema from '../../src/lib/server/db/schema';
import { APP_DIR } from './env';

export async function openDb(
	url: string | undefined
): Promise<{ db: Db; close: () => Promise<void>; local: boolean }> {
	if (!url || url.startsWith('pglite:')) {
		const { PGlite } = await import('@electric-sql/pglite');
		const { drizzle } = await import('drizzle-orm/pglite');
		const { migrate } = await import('drizzle-orm/pglite/migrator');
		const dir = url ? url.slice('pglite:'.length) : path.join(APP_DIR, '.local/pglite');
		mkdirSync(dir, { recursive: true });
		const client = new PGlite(dir);
		const db = drizzle(client, { schema });
		await migrate(db, { migrationsFolder: path.join(APP_DIR, 'drizzle') });
		return { db: db as unknown as Db, close: () => client.close(), local: true };
	}
	const pool = new Pool({ connectionString: url });
	return {
		db: drizzlePool(pool, { schema }) as unknown as Db,
		close: () => pool.end(),
		local: false
	};
}

export function openHttp(url: string): Db {
	return drizzleHttp(neon(url), { schema }) as unknown as Db;
}

export { schema };
