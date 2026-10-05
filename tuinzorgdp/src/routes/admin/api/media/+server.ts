import { json, type RequestHandler } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { toAdminMedia } from '$lib/server/admin-media';
import { requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { storeUpload } from '$lib/server/media';
import { storage } from '$lib/server/storage';

/** The media library for the picker. */
export const GET: RequestHandler = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const rows = await db.select().from(schema.media).orderBy(desc(schema.media.created_at));
	return json({ media: rows.map(toAdminMedia) });
};

/** Upload: the browser already scaled the photo; here the bytes are sniffed and stored. */
export const POST: RequestHandler = async ({ locals, request }) => {
	requireUser(locals);
	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File)) return json({ message: 'Kies een foto.' }, { status: 400 });
	const db = await locals.db();
	const result = await storeUpload(db, await storage(), file, String(form.get('alt') ?? ''));
	if (!result.ok) return json({ message: result.message }, { status: 415 });
	return json({ media: toAdminMedia(result.media) });
};
