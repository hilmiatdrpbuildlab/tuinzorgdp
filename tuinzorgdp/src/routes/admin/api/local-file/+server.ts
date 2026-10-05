import { dev } from '$app/environment';
import { error, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/cms';
import { storage } from '$lib/server/storage';

/** Local development only: serves the folder-backed storage the way signed URLs do in production. */
export const GET: RequestHandler = async ({ locals, url }) => {
	if (!dev) error(404, 'Niet gevonden');
	requireUser(locals);
	const key = url.searchParams.get('key') ?? '';
	const exp = Number(url.searchParams.get('exp') ?? 0);
	if (!key.startsWith('requests/') && !key.startsWith('originals/'))
		error(400, 'Ongeldige sleutel');
	if (Date.now() > exp) error(403, 'Link verlopen');
	const body = await (await storage()).get(key);
	if (!body) error(404, 'Niet gevonden');
	return new Response(body, {
		headers: { 'content-type': 'image/jpeg', 'cache-control': 'no-store' }
	});
};
