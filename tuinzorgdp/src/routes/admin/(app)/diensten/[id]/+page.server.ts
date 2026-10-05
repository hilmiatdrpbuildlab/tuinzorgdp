import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { LIMITS, seoGuards, slugify, type Guard } from '$lib/rules';
import { mediaMap, toAdminMedia } from '$lib/server/admin-media';
import {
	markChanged,
	recordSlugChange,
	removeUsages,
	requireUser,
	syncUsages
} from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { dbMessage, saveTx } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

const ICONS = ['mower', 'grass', 'shovel', 'scissors', 'fence', 'ruler', 'layers'] as const;

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [service] = await db
		.select()
		.from(schema.services)
		.where(eq(schema.services.id, params.id));
	if (!service) error(404, 'Niet gevonden');
	const media = await mediaMap(db, [service.cover_media_id]);
	return { service, cover: toAdminMedia(media.get(service.cover_media_id ?? '')), icons: ICONS };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const db = await locals.db();
		const [current] = await db
			.select()
			.from(schema.services)
			.where(eq(schema.services.id, params.id));
		if (!current) error(404, 'Niet gevonden');

		const values = {
			title: f.str('title'),
			slug: slugify(f.str('slug') || f.str('title')),
			short_label: f.str('short_label'),
			subtitle: f.opt('subtitle'),
			summary: f.str('summary'),
			body: f.opt('body'),
			bullets: f.list('bullets').slice(0, LIMITS.bullets),
			icon: (ICONS as readonly string[]).includes(f.str('icon'))
				? (f.str('icon') as (typeof ICONS)[number])
				: current.icon,
			cover_media_id: f.id('cover'),
			is_featured: f.bool('is_featured'),
			is_published: f.bool('is_published'),
			seo_title: f.opt('seo_title'),
			meta_description: f.opt('meta_description')
		};

		const errors: Record<string, string> = {};
		if (!values.title) errors.title = 'Vul een titel in.';
		if (!values.short_label) errors.short_label = 'Vul een kort label in.';
		if (!values.summary) errors.summary = 'Vul een samenvatting in.';
		if (values.summary.length > LIMITS.summary)
			errors.summary = `Maximaal ${LIMITS.summary} tekens.`;
		const guards: Guard[] = seoGuards(values);
		if (values.cover_media_id && values.is_published) {
			const m = (await mediaMap(db, [values.cover_media_id])).get(values.cover_media_id);
			if (m && !m.alt.trim())
				guards.push({
					field: 'cover',
					message: 'De foto heeft nog geen alt-tekst. Beschrijf wat je ziet.'
				});
		}
		if (Object.keys(errors).length || guards.length)
			return fail(400, { errors, guards, message: 'Controleer de velden.' });

		try {
			await saveTx(db, async (tx) => {
				if (values.is_featured) {
					await tx
						.update(schema.services)
						.set({ is_featured: false })
						.where(and(eq(schema.services.is_featured, true), ne(schema.services.id, params.id)));
				}
				await tx.update(schema.services).set(values).where(eq(schema.services.id, params.id));
				if (current.slug !== values.slug)
					await recordSlugChange(tx, '/diensten', current.slug, values.slug);
				await markChanged(tx, 'services', params.id, `Dienst ${values.title}`);
				return syncUsages(tx, 'services', params.id, [
					{ field: 'cover', mediaId: values.cover_media_id }
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
		const [s] = await db.select().from(schema.services).where(eq(schema.services.id, params.id));
		if (!s) error(404, 'Niet gevonden');
		const used = await db
			.select({ id: schema.projects.id })
			.from(schema.projects)
			.where(eq(schema.projects.service_id, params.id))
			.limit(1);
		if (used.length)
			return fail(400, {
				errors: {},
				guards: [],
				message: 'Deze dienst heeft nog realisaties. Verplaats of verwijder die eerst.'
			});
		await saveTx(db, async (tx) => {
			const dropped = await removeUsages(tx, 'services', params.id);
			await tx.delete(schema.services).where(eq(schema.services.id, params.id));
			await markChanged(tx, 'services', params.id, `Dienst ${s.title}`, 'verwijderd');
			return dropped;
		});
		redirect(303, '/admin/diensten');
	}
};
