import { redirect } from '@sveltejs/kit';
import { asc, sql } from 'drizzle-orm';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { orderAction } from '$lib/server/order';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const [rows, services] = await Promise.all([
		db.select().from(schema.faqs).orderBy(asc(schema.faqs.sort_order)),
		db.select({ id: schema.services.id, title: schema.services.title }).from(schema.services)
	]);
	const svc = new Map(services.map((s) => [s.id, s.title]));
	return {
		items: rows.map((q) => ({
			id: q.id,
			title: q.question,
			meta: (q.service_id && svc.get(q.service_id)) || 'Algemeen',
			badge: !q.is_published
				? { text: 'Verborgen', tone: 'default' as const }
				: q.show_on_home
					? { text: 'Op home', tone: 'success' as const }
					: null
		}))
	};
};

export const actions: Actions = {
	order: orderAction(schema.faqs, 'faqs', 'FAQ'),
	create: async ({ locals }) => {
		requireUser(locals);
		const db = await locals.db();
		const [{ n }] = await db
			.select({ n: sql<number>`coalesce(max(${schema.faqs.sort_order}), 0)::int` })
			.from(schema.faqs);
		const [row] = await db
			.insert(schema.faqs)
			.values({ question: 'Nieuwe vraag', answer: '', sort_order: n + 1, is_published: false })
			.returning();
		await markChanged(db, 'faqs', row.id, 'Nieuwe vraag', 'toegevoegd');
		redirect(303, `/admin/faq/${row.id}`);
	}
};
