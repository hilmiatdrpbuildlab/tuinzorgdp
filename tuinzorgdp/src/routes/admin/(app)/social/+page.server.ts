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
	const rows = await db
		.select()
		.from(schema.socialPosts)
		.orderBy(asc(schema.socialPosts.sort_order));
	return {
		items: rows.map((p) => ({
			id: p.id,
			title: p.caption || (p.network === 'instagram' ? 'Instagram-bericht' : 'Facebook-bericht'),
			meta: [p.network === 'instagram' ? 'Instagram' : 'Facebook', p.posted_on]
				.filter(Boolean)
				.join(' · '),
			thumb: p.media_id ? adminSrc(p.media_id) : null,
			badge: !p.media_id
				? { text: 'Foto ontbreekt', tone: 'warning' as const }
				: p.is_published
					? { text: 'Gepubliceerd', tone: 'success' as const }
					: { text: 'Verborgen', tone: 'default' as const }
		}))
	};
};

export const actions: Actions = {
	order: orderAction(schema.socialPosts, 'social_posts', 'social'),
	create: async ({ locals }) => {
		requireUser(locals);
		const db = await locals.db();
		const [{ n }] = await db
			.select({ n: sql<number>`coalesce(min(${schema.socialPosts.sort_order}), 0)::int` })
			.from(schema.socialPosts);
		// New posts go on top: the site shows the first six.
		const [row] = await db
			.insert(schema.socialPosts)
			.values({ network: 'instagram', url: '', sort_order: n - 1, is_published: false })
			.returning();
		await markChanged(db, 'social_posts', row.id, 'Social-bericht', 'toegevoegd');
		redirect(303, `/admin/social/${row.id}`);
	}
};
