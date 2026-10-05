import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq, inArray } from 'drizzle-orm';
import { projectGuards, seoGuards, slugify } from '$lib/rules';
import { adminSrc, mediaMap, toAdminMedia } from '$lib/server/admin-media';
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

type PhotoInput = {
	media_id: string;
	role: 'before' | 'after' | 'process' | 'result';
	in_home_gallery: boolean;
	alt: string;
};
const ROLES = ['before', 'after', 'process', 'result'];

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [project] = await db
		.select()
		.from(schema.projects)
		.where(eq(schema.projects.id, params.id));
	if (!project) error(404, 'Niet gevonden');
	const [photos, services, areas] = await Promise.all([
		db
			.select()
			.from(schema.projectMedia)
			.where(eq(schema.projectMedia.project_id, params.id))
			.orderBy(asc(schema.projectMedia.sort_order)),
		db
			.select({ id: schema.services.id, title: schema.services.title })
			.from(schema.services)
			.orderBy(asc(schema.services.sort_order)),
		db
			.select({ id: schema.serviceAreas.id, name: schema.serviceAreas.name })
			.from(schema.serviceAreas)
			.orderBy(asc(schema.serviceAreas.sort_order))
	]);
	const media = await mediaMap(db, [project.cover_media_id, ...photos.map((p) => p.media_id)]);
	return {
		project,
		services,
		areas,
		cover: toAdminMedia(media.get(project.cover_media_id ?? '')),
		photos: photos
			.filter((p) => media.has(p.media_id))
			.map((p) => {
				const m = media.get(p.media_id)!;
				return {
					media_id: p.media_id,
					src: adminSrc(p.media_id),
					alt: m.alt,
					width: m.width,
					height: m.height,
					role: p.role,
					in_home_gallery: p.in_home_gallery
				};
			})
	};
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const db = await locals.db();
		const [current] = await db
			.select()
			.from(schema.projects)
			.where(eq(schema.projects.id, params.id));
		if (!current) error(404, 'Niet gevonden');

		const photos = f
			.json<PhotoInput[]>('photos', [])
			.filter((p) => typeof p?.media_id === 'string' && /^[0-9a-f-]{36}$/.test(p.media_id))
			.map((p) => ({
				...p,
				role: ROLES.includes(p.role) ? p.role : 'result',
				alt: String(p.alt ?? '')
					.trim()
					.slice(0, 300)
			}));
		const values = {
			title: f.str('title'),
			slug: slugify(f.str('slug') || f.str('title')),
			service_id: f.id('service_id') ?? current.service_id,
			service_area_id: f.id('service_area_id'),
			summary: f.opt('summary'),
			body: f.opt('body'),
			cover_media_id: f.id('cover'),
			completed_on: f.date('completed_on'),
			is_featured: f.bool('is_featured'),
			is_published: f.bool('is_published'),
			seo_title: f.opt('seo_title'),
			meta_description: f.opt('meta_description')
		};
		const errors: Record<string, string> = {};
		if (!values.title) errors.title = 'Vul een titel in.';

		// Publishing guards: a cover, at least one gallery photo, alt text on every photo.
		const guards = seoGuards(values);
		if (values.is_published) {
			const media = await mediaMap(db, [values.cover_media_id]);
			const coverAltMissing =
				values.cover_media_id &&
				!media.get(values.cover_media_id)?.alt.trim() &&
				!photos.find((p) => p.media_id === values.cover_media_id)?.alt;
			guards.push(
				...projectGuards({
					cover_media_id: values.cover_media_id,
					galleryCount: photos.length,
					missingAlt: photos.filter((p) => !p.alt).length + (coverAltMissing ? 1 : 0)
				})
			);
		}
		if (Object.keys(errors).length || guards.length)
			return fail(400, {
				errors,
				guards,
				message: guards.length ? undefined : 'Controleer de velden.'
			});

		try {
			await saveTx(db, async (tx) => {
				await tx.update(schema.projects).set(values).where(eq(schema.projects.id, params.id));
				const existing = await tx
					.select()
					.from(schema.projectMedia)
					.where(eq(schema.projectMedia.project_id, params.id));
				const keep = new Set(photos.map((p) => p.media_id));
				const gone = existing.filter((e) => !keep.has(e.media_id)).map((e) => e.id);
				if (gone.length)
					await tx.delete(schema.projectMedia).where(inArray(schema.projectMedia.id, gone));
				for (const [i, p] of photos.entries()) {
					const row = existing.find((e) => e.media_id === p.media_id);
					if (row) {
						await tx
							.update(schema.projectMedia)
							.set({ role: p.role, in_home_gallery: p.in_home_gallery, sort_order: i })
							.where(eq(schema.projectMedia.id, row.id));
					} else {
						await tx.insert(schema.projectMedia).values({
							project_id: params.id,
							media_id: p.media_id,
							role: p.role,
							in_home_gallery: p.in_home_gallery,
							sort_order: i
						});
					}
					await tx.update(schema.media).set({ alt: p.alt }).where(eq(schema.media.id, p.media_id));
				}
				if (current.slug !== values.slug)
					await recordSlugChange(tx, '/realisaties', current.slug, values.slug);
				await markChanged(tx, 'projects', params.id, `Realisatie ${values.title}`);
				return syncUsages(tx, 'projects', params.id, [
					{ field: 'cover', mediaId: values.cover_media_id },
					...photos.map((p) => ({ field: 'photos', mediaId: p.media_id }))
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
		const [p] = await db.select().from(schema.projects).where(eq(schema.projects.id, params.id));
		if (!p) error(404, 'Niet gevonden');
		await saveTx(db, async (tx) => {
			const dropped = await removeUsages(tx, 'projects', params.id);
			await tx.delete(schema.projects).where(eq(schema.projects.id, params.id));
			await markChanged(tx, 'projects', params.id, `Realisatie ${p.title}`, 'verwijderd');
			return dropped;
		});
		redirect(303, '/admin/realisaties');
	}
};
