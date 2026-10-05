// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Db } from '$lib/server/db/client';

declare global {
	namespace App {
		interface Platform {
			env: Env & Record<string, string | undefined>;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		interface Locals {
			/** Lazily opened per request; closed when the response is sent. */
			db: () => Promise<Db>;
			user: { id: string; email: string; name: string } | null;
			session: { id: string; expiresAt: Date } | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
