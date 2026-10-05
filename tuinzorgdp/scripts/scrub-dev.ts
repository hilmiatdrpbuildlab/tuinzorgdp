/**
 * Run on the Neon `dev` branch after resetting it from `main`: deletes every request and its photos,
 * so real customer data never sits in a preview environment. Refuses to run without --yes, and
 * refuses a connection string that does not look like the dev branch unless --force is given.
 */
import { s3Storage } from '../src/lib/server/storage-core';
import { openDb, schema } from './lib/db';
import { env, requireEnv } from './lib/env';

const url = requireEnv('DATABASE_URL');
if (!process.argv.includes('--yes')) {
	console.error(
		'This deletes every request on the database in DATABASE_URL. Add --yes to continue.'
	);
	process.exit(1);
}
if (!/dev/i.test(url) && !process.argv.includes('--force')) {
	console.error('DATABASE_URL does not look like the dev branch. Add --force if it is.');
	process.exit(1);
}
const { db, close } = await openDb(url);
const files = await db.select().from(schema.requestFiles);
const endpoint = env('STORAGE_ENDPOINT');
if (endpoint && files.length) {
	const store = s3Storage({
		endpoint,
		bucket: env('STORAGE_BUCKET') ?? 'media',
		accessKeyId: requireEnv('STORAGE_ACCESS_KEY_ID'),
		secretAccessKey: requireEnv('STORAGE_SECRET_ACCESS_KEY')
	});
	for (const f of files) await store.delete(f.object_key);
}
const deleted = await db.delete(schema.requests).returning({ id: schema.requests.id });
await db.delete(schema.submitAttempts);
console.log(`[scrub-dev] ${deleted.length} requests and ${files.length} photos deleted`);
await close();
