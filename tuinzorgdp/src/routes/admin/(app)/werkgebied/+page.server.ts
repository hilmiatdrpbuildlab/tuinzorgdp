import { fail, redirect } from '@sveltejs/kit';
import { asc, count, eq, sql } from 'drizzle-orm';
import { LIMITS, slugify, wordCount } from '$lib/rules';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { orderAction } from '$lib/server/order';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const rows = await db
		.select()
		.from(schema.serviceAreas)
		.orderBy(asc(schema.serviceAreas.sort_order));
	return {
		items: rows.map((a) => {
			const words = wordCount(a.intro);
			return {
				id: a.id,
				title: a.name,
				meta: [a.postcode, `${words} woorden`, a.is_primary ? 'Hoofdgemeente' : null]
					.filter(Boolean)
					.join(' · '),
				// The badge says why an area is not on the site yet.
				badge:
					words < LIMITS.areaIntroWords
						? { text: 'Intro te kort', tone: 'warning' as const }
						: !a.is_published
							? { text: 'Verborgen', tone: 'default' as const }
							: { text: 'Gepubliceerd', tone: 'success' as const }
			};
		})
	};
};

export const actions: Actions = {
	order: orderAction(schema.serviceAreas, 'service_areas', 'werkgebied'),
	create: async ({ request, locals }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const name = f.str('name');
		if (!name) return fail(400, { message: 'Geef de naam van de gemeente.' });
		const db = await locals.db();
		let slug = slugify(name) || 'gemeente';
		const [{ n }] = await db
			.select({ n: count() })
			.from(schema.serviceAreas)
			.where(eq(schema.serviceAreas.slug, slug));
		if (n > 0) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
		const [{ max }] = await db
			.select({ max: sql<number>`coalesce(max(${schema.serviceAreas.sort_order}), 0)::int` })
			.from(schema.serviceAreas);
		const [row] = await db
			.insert(schema.serviceAreas)
			.values({ name, slug, sort_order: max + 1, is_published: false })
			.returning();
		await markChanged(db, 'service_areas', row.id, `Werkgebied ${name}`, 'toegevoegd');
		redirect(303, `/admin/werkgebied/${row.id}`);
	}
};
