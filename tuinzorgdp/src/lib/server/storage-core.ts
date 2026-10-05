/**
 * Neon Object Storage (S3-compatible) through aws4fetch, which runs on Workers and in Node.
 * Every bucket call in the app goes through this file, so moving to Cloudflare R2 means only a new
 * endpoint and new credentials (docs/cms-plan/04-media.md). Path-style URLs, as Neon requires.
 * No SvelteKit imports: the build scripts use it too.
 */
import { AwsClient } from 'aws4fetch';

export type StorageConfig = {
	endpoint: string;
	bucket: string;
	accessKeyId: string;
	secretAccessKey: string;
	region?: string;
};

export interface Storage {
	put(key: string, body: ArrayBuffer | Uint8Array, contentType: string): Promise<void>;
	get(key: string): Promise<ArrayBuffer | null>;
	delete(key: string): Promise<void>;
	/** A GET URL that stops working after `seconds`. */
	signedUrl(key: string, seconds: number): Promise<string>;
}

export function s3Storage(cfg: StorageConfig): Storage {
	const client = new AwsClient({
		accessKeyId: cfg.accessKeyId,
		secretAccessKey: cfg.secretAccessKey,
		service: 's3',
		region: cfg.region ?? 'auto'
	});
	const base = cfg.endpoint.replace(/\/$/, '');
	const url = (key: string) =>
		`${base}/${encodeURIComponent(cfg.bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`;

	return {
		async put(key, body, contentType) {
			const res = await client.fetch(url(key), {
				method: 'PUT',
				body: body as BodyInit,
				headers: { 'content-type': contentType }
			});
			if (!res.ok) throw new Error(`Storage PUT ${key} failed: ${res.status} ${await res.text()}`);
		},
		async get(key) {
			const res = await client.fetch(url(key));
			if (res.status === 404) return null;
			if (!res.ok) throw new Error(`Storage GET ${key} failed: ${res.status}`);
			return res.arrayBuffer();
		},
		async delete(key) {
			const res = await client.fetch(url(key), { method: 'DELETE' });
			if (!res.ok && res.status !== 404)
				throw new Error(`Storage DELETE ${key} failed: ${res.status}`);
		},
		async signedUrl(key, seconds) {
			const u = new URL(url(key));
			u.searchParams.set('X-Amz-Expires', String(seconds));
			const signed = await client.sign(new Request(u, { method: 'GET' }), {
				aws: { signQuery: true }
			});
			return signed.url;
		}
	};
}

/** Folder-backed storage for local development without a bucket (.local/storage). */
export async function fileStorage(root: string): Promise<Storage> {
	const fs = await import('node:fs/promises');
	const path = await import('node:path');
	const full = (key: string) => path.join(root, ...key.split('/'));
	return {
		async put(key, body) {
			await fs.mkdir(path.dirname(full(key)), { recursive: true });
			await fs.writeFile(full(key), body instanceof Uint8Array ? body : new Uint8Array(body));
		},
		async get(key) {
			try {
				const b = await fs.readFile(full(key));
				return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
			} catch {
				return null;
			}
		},
		async delete(key) {
			await fs.rm(full(key), { force: true });
		},
		async signedUrl(key, seconds) {
			const exp = Date.now() + seconds * 1000;
			return `/admin/api/local-file?key=${encodeURIComponent(key)}&exp=${exp}`;
		}
	};
}
