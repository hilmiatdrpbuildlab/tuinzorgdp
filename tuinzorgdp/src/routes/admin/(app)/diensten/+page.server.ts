import { redirect } from '@sveltejs/kit';
import { asc, sql } from 'drizzle-orm';
import { adminSrc } from '$lib/server/admin-media';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { orderAction } from '$lib/server/order';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const rows = await db.select().from(schema.services).orderBy(asc(schema.services.sort_order));
	return {
		items: rows.map((s) => ({
			id: s.id,
			title: s.title,
			meta: s.subtitle ?? s.summary,
			thumb: s.cover_media_id ? adminSrc(s.cover_media_id) : null,
			badge: !s.is_published
				? { text: 'Verborgen', tone: 'default' as const }
				: !s.cover_media_id
					? { text: 'Foto ontbreekt', tone: 'warning' as const }
					: s.is_featured
						? { text: 'Uitgelicht', tone: 'success' as const }
						: null
		}))
	};
};

export const actions: Actions = {
	order: orderAction(schema.services, 'services', 'diensten'),
	create: async ({ locals }) => {
		requireUser(locals);
		const db = await locals.db();
		const [{ n }] = await db
			.select({ n: sql<number>`coalesce(max(${schema.services.sort_order}), 0)::int` })
			.from(schema.services);
		const slug = `nieuwe-dienst-${Date.now().toString(36)}`;
		const [row] = await db
			.insert(schema.services)
			.values({
				slug,
				title: 'Nieuwe dienst',
				short_label: 'Nieuw',
				summary: 'Korte samenvatting.',
				icon: 'shovel',
				sort_order: n + 1,
				is_published: false
			})
			.returning();
		await markChanged(db, 'services', row.id, 'Nieuwe dienst', 'toegevoegd');
		redirect(303, `/admin/diensten/${row.id}`);
	}
};
