/**
 * Phase 0 check: the read/write credential uploads, reads and deletes a test file; the read-only
 * credential is refused a write.
 */
import { s3Storage } from '../src/lib/server/storage-core';
import { env, requireEnv } from './lib/env';

const endpoint = requireEnv('STORAGE_ENDPOINT');
const bucket = env('STORAGE_BUCKET') ?? 'media';
const rw = s3Storage({
	endpoint,
	bucket,
	accessKeyId: requireEnv('STORAGE_ACCESS_KEY_ID'),
	secretAccessKey: requireEnv('STORAGE_SECRET_ACCESS_KEY'),
	region: env('STORAGE_REGION')
});
const key = `healthcheck/${Date.now()}.txt`;
const body = new TextEncoder().encode('TuinZorg DP storage check');

await rw.put(key, body, 'text/plain');
const back = await rw.get(key);
if (!back || new TextDecoder().decode(back) !== 'TuinZorg DP storage check')
	throw new Error('read-back failed');
console.log('read/write credential: upload, read OK');

const ro = env('STORAGE_READ_KEY_ID');
if (ro) {
	const reader = s3Storage({
		endpoint,
		bucket,
		accessKeyId: ro,
		secretAccessKey: requireEnv('STORAGE_READ_SECRET'),
		region: env('STORAGE_REGION')
	});
	if (!(await reader.get(key))) throw new Error('the read-only credential cannot read');
	try {
		await reader.put(`${key}.ro`, body, 'text/plain');
		console.error('FAIL: the read-only credential could write');
		process.exitCode = 1;
	} catch {
		console.log('read-only credential: read OK, write refused');
	}
}
await rw.delete(key);
console.log('test file deleted');
