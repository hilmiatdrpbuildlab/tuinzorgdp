import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { areaGuards, seoGuards, slugify, type Guard } from '$lib/rules';
import { markChanged, recordSlugChange, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { dbMessage, saveTx } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [area] = await db
		.select()
		.from(schema.serviceAreas)
		.where(eq(schema.serviceAreas.id, params.id));
	if (!area) error(404, 'Niet gevonden');
	return { area };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const db = await locals.db();
		const [current] = await db
			.select()
			.from(schema.serviceAreas)
			.where(eq(schema.serviceAreas.id, params.id));
		if (!current) error(404, 'Niet gevonden');

		const values = {
			name: f.str('name'),
			slug: slugify(f.str('slug') || f.str('name')),
			postcode: f.opt('postcode'),
			is_primary: f.bool('is_primary'),
			intro: f.opt('intro'),
			is_published: f.bool('is_published'),
			seo_title: f.opt('seo_title'),
			meta_description: f.opt('meta_description')
		};

		const errors: Record<string, string> = {};
		if (!values.name) errors.name = 'Vul de naam van de gemeente in.';
		if (!values.slug) errors.slug = 'Vul een slug in.';
		// Publishing guards: an intro of at least 80 words, and SEO texts within their limits.
		const guards: Guard[] = [
			...seoGuards(values),
			...(values.is_published ? areaGuards(values) : [])
		];
		if (Object.keys(errors).length || guards.length)
			return fail(400, {
				errors,
				guards,
				message: guards.length && !Object.keys(errors).length ? undefined : 'Controleer de velden.'
			});

		try {
			await saveTx(db, async (tx) => {
				// Only one primary municipality.
				if (values.is_primary) {
					await tx
						.update(schema.serviceAreas)
						.set({ is_primary: false })
						.where(
							and(eq(schema.serviceAreas.is_primary, true), ne(schema.serviceAreas.id, params.id))
						);
				}
				await tx
					.update(schema.serviceAreas)
					.set(values)
					.where(eq(schema.serviceAreas.id, params.id));
				if (current.slug !== values.slug)
					await recordSlugChange(tx, '/tuinonderhoud', current.slug, values.slug);
				await markChanged(tx, 'service_areas', params.id, `Werkgebied ${values.name}`);
			});
		} catch (e) {
			return fail(400, { errors: {}, guards: [], message: dbMessage(e) });
		}
		return { saved: true };
	},
	delete: async ({ locals, params }) => {
		requireUser(locals);
		const db = await locals.db();
		const [a] = await db
			.select()
			.from(schema.serviceAreas)
			.where(eq(schema.serviceAreas.id, params.id));
		if (!a) error(404, 'Niet gevonden');
		// projects.service_area_id is set to null by the foreign key.
		await saveTx(db, async (tx) => {
			await tx.delete(schema.serviceAreas).where(eq(schema.serviceAreas.id, params.id));
			await markChanged(tx, 'service_areas', params.id, `Werkgebied ${a.name}`, 'verwijderd');
		});
		redirect(303, '/admin/werkgebied');
	}
};
