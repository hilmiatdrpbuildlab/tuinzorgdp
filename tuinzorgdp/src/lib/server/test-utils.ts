/** Test helpers: an in-memory, migrated PGlite database and an in-memory bucket. */
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import path from 'node:path';
import type { Db } from './db/client';
import * as schema from './db/schema';
import type { Storage } from './storage-core';

export async function memoryDb(): Promise<Db> {
	const db = drizzle(new PGlite(), { schema });
	await migrate(db, { migrationsFolder: path.resolve('drizzle') });
	return db as unknown as Db;
}

export function memoryStorage(): Storage & { files: Map<string, Uint8Array>; failPut?: boolean } {
	const files = new Map<string, Uint8Array>();
	const s = {
		files,
		failPut: false,
		async put(key: string, body: ArrayBuffer | Uint8Array) {
			if (s.failPut) throw new Error('storage down');
			files.set(key, body instanceof Uint8Array ? body : new Uint8Array(body));
		},
		async get(key: string) {
			const b = files.get(key);
			return b ? (b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer) : null;
		},
		async delete(key: string) {
			files.delete(key);
		},
		async signedUrl(key: string, seconds: number) {
			return `https://storage.test/${key}?exp=${seconds}`;
		}
	};
	return s;
}

/** The smallest valid JPEG header bytes (enough for sniffing). */
export const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);
