import { fail, redirect } from '@sveltejs/kit';
import { asc, count, eq, sql } from 'drizzle-orm';
import { slugify } from '$lib/rules';
import { adminSrc } from '$lib/server/admin-media';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { orderAction } from '$lib/server/order';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const [rows, services, photoCounts] = await Promise.all([
		db.select().from(schema.projects).orderBy(asc(schema.projects.sort_order)),
		db
			.select({ id: schema.services.id, title: schema.services.title })
			.from(schema.services)
			.orderBy(asc(schema.services.sort_order)),
		db
			.select({ id: schema.projectMedia.project_id, n: count() })
			.from(schema.projectMedia)
			.groupBy(schema.projectMedia.project_id)
	]);
	const svc = new Map(services.map((s) => [s.id, s.title]));
	const photos = new Map(photoCounts.map((p) => [p.id, p.n]));
	return {
		services,
		items: rows.map((p) => ({
			id: p.id,
			title: p.title,
			meta: `${svc.get(p.service_id) ?? ''} · ${photos.get(p.id) ?? 0} foto's`,
			thumb: p.cover_media_id ? adminSrc(p.cover_media_id) : null,
			badge: p.is_published
				? { text: 'Gepubliceerd', tone: 'success' as const }
				: { text: 'Ontwerp', tone: 'default' as const }
		}))
	};
};

export const actions: Actions = {
	order: orderAction(schema.projects, 'projects', 'realisaties'),
	create: async ({ request, locals }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const title = f.str('title');
		const serviceId = f.id('service_id');
		if (!title || !serviceId) return fail(400, { message: 'Geef een titel en kies de dienst.' });
		const db = await locals.db();
		let slug = slugify(title) || 'realisatie';
		const [{ n }] = await db
			.select({ n: count() })
			.from(schema.projects)
			.where(eq(schema.projects.slug, slug));
		if (n > 0) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
		const [{ max }] = await db
			.select({ max: sql<number>`coalesce(min(${schema.projects.sort_order}), 0)::int` })
			.from(schema.projects);
		const [row] = await db
			.insert(schema.projects)
			.values({ title, slug, service_id: serviceId, sort_order: max - 1, is_published: false })
			.returning();
		await markChanged(db, 'projects', row.id, `Realisatie ${title}`, 'toegevoegd');
		redirect(303, `/admin/realisaties/${row.id}`);
	}
};
