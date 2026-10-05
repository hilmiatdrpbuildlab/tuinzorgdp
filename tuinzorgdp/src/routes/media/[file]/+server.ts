import { dev } from '$app/environment';
import { error, type RequestHandler } from '@sveltejs/kit';

export const prerender = false;

/**
 * Local development only: generates a WebP variant on request when scripts/build-images.ts has not
 * written it yet (photos uploaded in the local CMS). In production the build output serves /media,
 * and the `if (dev)` block (with sharp) is removed from the bundle.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (dev) {
		const m = /^([0-9a-f-]{36})-(\d+)\.webp$/.exec(params.file ?? '');
		if (m) {
			const { generateDevVariant } = await import('$lib/server/dev-media');
			const body = await generateDevVariant(await locals.db(), m[1], Number(m[2]));
			if (body)
				return new Response(body as unknown as BodyInit, {
					headers: { 'content-type': 'image/webp', 'cache-control': 'no-cache' }
				});
		}
	}
	error(404, 'Not Found');
};
