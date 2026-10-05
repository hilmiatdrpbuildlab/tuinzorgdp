import { redirect } from '@sveltejs/kit';
import { asc, sql } from 'drizzle-orm';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { orderAction } from '$lib/server/order';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const rows = await db.select().from(schema.reviews).orderBy(asc(schema.reviews.sort_order));
	return {
		items: rows.map((r) => ({
			id: r.id,
			title: r.author_name,
			meta: `${'★'.repeat(r.rating)} · ${r.source === 'google' ? 'Google' : 'Rechtstreeks'}${r.place ? ` · ${r.place}` : ''}`,
			badge: !r.consent_confirmed
				? { text: 'Toestemming ontbreekt', tone: 'warning' as const }
				: r.is_published
					? { text: 'Gepubliceerd', tone: 'success' as const }
					: { text: 'Verborgen', tone: 'default' as const }
		}))
	};
};

export const actions: Actions = {
	order: orderAction(schema.reviews, 'reviews', 'reviews'),
	create: async ({ locals }) => {
		requireUser(locals);
		const db = await locals.db();
		const [{ n }] = await db
			.select({ n: sql<number>`coalesce(max(${schema.reviews.sort_order}), 0)::int` })
			.from(schema.reviews);
		const [row] = await db
			.insert(schema.reviews)
			.values({ quote: '', author_name: 'Nieuwe review', sort_order: n + 1, is_published: false })
			.returning();
		await markChanged(db, 'reviews', row.id, 'Nieuwe review', 'toegevoegd');
		redirect(303, `/admin/reviews/${row.id}`);
	}
};
