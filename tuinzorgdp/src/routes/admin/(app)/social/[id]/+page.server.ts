import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Guard } from '$lib/rules';
import { mediaMap, toAdminMedia } from '$lib/server/admin-media';
import { markChanged, removeUsages, requireUser, syncUsages } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { dbMessage, saveTx } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

const CAPTION_MAX = 120;
const URL_PREFIXES = [
	'https://www.instagram.com/',
	'https://www.facebook.com/',
	'https://instagram.com/',
	'https://facebook.com/',
	'https://fb.watch/'
];

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [post] = await db
		.select()
		.from(schema.socialPosts)
		.where(eq(schema.socialPosts.id, params.id));
	if (!post) error(404, 'Niet gevonden');
	const media = await mediaMap(db, [post.media_id]);
	return { post, photo: toAdminMedia(media.get(post.media_id ?? '')), captionMax: CAPTION_MAX };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const db = await locals.db();
		const [current] = await db
			.select()
			.from(schema.socialPosts)
			.where(eq(schema.socialPosts.id, params.id));
		if (!current) error(404, 'Niet gevonden');

		const values = {
			network: f.str('network') === 'facebook' ? ('facebook' as const) : ('instagram' as const),
			url: f.str('url'),
			media_id: f.id('media'),
			caption: f.opt('caption'),
			posted_on: f.date('posted_on'),
			is_published: f.bool('is_published')
		};

		const errors: Record<string, string> = {};
		if (!values.url) errors.url = 'Plak de link naar het bericht.';
		else if (!URL_PREFIXES.some((p) => values.url.startsWith(p)))
			errors.url =
				'De link moet naar Instagram of Facebook gaan, bv. https://www.instagram.com/p/…';
		if ((values.caption?.length ?? 0) > CAPTION_MAX)
			errors.caption = `Maximaal ${CAPTION_MAX} tekens.`;
		// Publishing guard: a photo with alt text.
		const guards: Guard[] = [];
		if (values.is_published) {
			const m = values.media_id
				? (await mediaMap(db, [values.media_id])).get(values.media_id)
				: undefined;
			if (!m) guards.push({ field: 'media', message: 'Kies een foto voor dit bericht.' });
			else if (!m.alt.trim())
				guards.push({
					field: 'media',
					message: 'De foto heeft nog geen alt-tekst. Beschrijf wat u ziet.'
				});
		}
		if (Object.keys(errors).length || guards.length)
			return fail(400, {
				errors,
				guards,
				message: guards.length && !Object.keys(errors).length ? undefined : 'Controleer de velden.'
			});

		try {
			await saveTx(db, async (tx) => {
				await tx.update(schema.socialPosts).set(values).where(eq(schema.socialPosts.id, params.id));
				await markChanged(tx, 'social_posts', params.id, 'Social-bericht');
				return syncUsages(tx, 'social_posts', params.id, [
					{ field: 'photo', mediaId: values.media_id }
				]);
			});
		} catch (e) {
			return fail(400, { errors: {}, guards: [], message: dbMessage(e) });
		}
		return { saved: true };
	},
	delete: async ({ locals, params }) => {
		requireUser(locals);
		const db = await locals.db();
		const [p] = await db
			.select()
			.from(schema.socialPosts)
			.where(eq(schema.socialPosts.id, params.id));
		if (!p) error(404, 'Niet gevonden');
		await saveTx(db, async (tx) => {
			const dropped = await removeUsages(tx, 'social_posts', params.id);
			await tx.delete(schema.socialPosts).where(eq(schema.socialPosts.id, params.id));
			await markChanged(tx, 'social_posts', params.id, 'Social-bericht', 'verwijderd');
			return dropped;
		});
		redirect(303, '/admin/social');
	}
};
