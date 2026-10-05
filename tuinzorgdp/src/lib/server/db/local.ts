/**
 * Local development database: PGlite (Postgres in WebAssembly) stored in .local/pglite, migrated from
 * drizzle/ on first use. Only imported by `vite dev` and the scripts; never part of a production build.
 */
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import * as schema from './schema';
import type { Db } from './client';

export const LOCAL_DB_DIR = path.resolve('.local/pglite');

export async function createLocalDb(dir = LOCAL_DB_DIR): Promise<Db> {
	mkdirSync(dir, { recursive: true });
	const client = new PGlite(dir);
	const db = drizzle(client, { schema });
	await migrate(db, { migrationsFolder: path.resolve('drizzle') });
	return db as unknown as Db;
}
