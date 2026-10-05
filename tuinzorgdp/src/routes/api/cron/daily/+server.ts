import { error, json, type RequestHandler } from '@sveltejs/kit';
import { dailyCron } from '$lib/server/cron';
import { env } from '$lib/server/env';
import { timingSafeEqual } from '$lib/server/gate';
import { storage } from '$lib/server/storage';

export const prerender = false;

/** Called by the Worker's scheduled handler (scripts/wrap-worker.ts) with CRON_SECRET. */
export const POST: RequestHandler = async ({ request, locals }) => {
	const secret = env('CRON_SECRET');
	if (!secret || !timingSafeEqual(request.headers.get('x-cron-secret') ?? '', secret))
		error(404, 'Not Found');
	const result = await dailyCron(await locals.db(), await storage());
	console.log('[cron daily]', result);
	return json(result);
};
