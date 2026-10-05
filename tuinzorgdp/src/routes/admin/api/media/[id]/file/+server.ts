import { error, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { storage } from '$lib/server/storage';

/** Streams an original from the bucket to the CMS (session-checked; visitors never load from the bucket). */
export const GET: RequestHandler = async ({ locals, params, fetch }) => {
	requireUser(locals);
	const db = await locals.db();
	const [m] = await db.select().from(schema.media).where(eq(schema.media.id, params.id!));
	if (!m) error(404, 'Niet gevonden');
	let body: ArrayBuffer | null = null;
	if (m.object_key.startsWith('ds:')) {
		// Seed photos that were never uploaded: the variant in the build output.
		const res = await fetch(`/media/${m.id}-${Math.min(m.width, 960)}.webp`);
		if (res.ok)
			return new Response(res.body, {
				headers: { 'content-type': 'image/webp', 'cache-control': 'private, max-age=3600' }
			});
	} else {
		body = await (await storage()).get(m.object_key);
	}
	if (!body) error(404, 'Bestand ontbreekt');
	return new Response(body, {
		headers: { 'content-type': m.mime, 'cache-control': 'private, max-age=3600' }
	});
};
