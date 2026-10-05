import { dev } from '$app/environment';
import { env } from './env';
import { fileStorage, s3Storage, type Storage } from './storage-core';

let local: Promise<Storage> | null = null;

/** The read/write bucket client for the Worker (STORAGE_* variables). */
export async function storage(): Promise<Storage> {
	const endpoint = env('STORAGE_ENDPOINT');
	const accessKeyId = env('STORAGE_ACCESS_KEY_ID');
	const secretAccessKey = env('STORAGE_SECRET_ACCESS_KEY');
	if (endpoint && accessKeyId && secretAccessKey) {
		return s3Storage({
			endpoint,
			bucket: env('STORAGE_BUCKET') ?? 'media',
			accessKeyId,
			secretAccessKey,
			region: env('STORAGE_REGION')
		});
	}
	if (dev) {
		local ??= fileStorage('.local/storage');
		return local;
	}
	throw new Error(
		'Object storage is not configured (STORAGE_ENDPOINT, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY)'
	);
}

export type { Storage };
