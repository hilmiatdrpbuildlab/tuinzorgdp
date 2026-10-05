import { error, json, type RequestHandler } from '@sveltejs/kit';
import { googleCron } from '$lib/server/cron';
import { env } from '$lib/server/env';
import { timingSafeEqual } from '$lib/server/gate';

export const prerender = false;

export const POST: RequestHandler = async ({ request, locals }) => {
	const secret = env('CRON_SECRET');
	if (!secret || !timingSafeEqual(request.headers.get('x-cron-secret') ?? '', secret))
		error(404, 'Not Found');
	const result = await googleCron(
		await locals.db(),
		env('GOOGLE_PLACES_KEY'),
		env('DEPLOY_HOOK_URL')
	);
	console.log('[cron google]', result);
	return json(result);
};
