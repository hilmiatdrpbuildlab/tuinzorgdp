import { desc, eq, isNull } from 'drizzle-orm';
import { LIMITS, wordCount } from '$lib/rules';
import { TABLE_LABELS, requireUser, unpublishedChanges } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const [changes, builds, requests, usages, media, services, reviews, areas, pages, projects] =
		await Promise.all([
			unpublishedChanges(db),
			db.select().from(schema.builds).orderBy(desc(schema.builds.triggered_at)).limit(5),
			db
				.select()
				.from(schema.requests)
				.where(eq(schema.requests.status, 'nieuw'))
				.orderBy(desc(schema.requests.created_at))
				.limit(5),
			db.select({ media_id: schema.mediaUsages.media_id }).from(schema.mediaUsages),
			db.select({ id: schema.media.id, alt: schema.media.alt }).from(schema.media),
			db.select().from(schema.services).where(isNull(schema.services.cover_media_id)),
			db.select().from(schema.reviews).where(eq(schema.reviews.consent_confirmed, false)),
			db.select().from(schema.serviceAreas),
			db
				.select({
					slug: schema.pages.slug,
					seo_title: schema.pages.seo_title,
					meta_description: schema.pages.meta_description
				})
				.from(schema.pages),
			db.select().from(schema.projects).where(eq(schema.projects.is_published, false))
		]);
	const used = new Set(usages.map((u) => u.media_id));
	const gaps = [
		{
			count: media.filter((m) => used.has(m.id) && !m.alt.trim()).length,
			label: "foto's zonder alt-tekst",
			href: '/admin/media?filter=alt'
		},
		{ count: services.length, label: 'diensten zonder foto', href: '/admin/diensten' },
		{
			count: pages.filter(
				(p) =>
					(p.seo_title?.length ?? 0) > LIMITS.seoTitle ||
					(p.meta_description?.length ?? 0) > LIMITS.metaDescription
			).length,
			label: 'SEO-teksten te lang',
			href: '/admin/seo'
		},
		{ count: reviews.length, label: 'reviews zonder toestemming', href: '/admin/reviews' },
		{
			count: areas.filter((a) => wordCount(a.intro) < LIMITS.areaIntroWords).length,
			label: 'werkgebiedpagina’s zonder intro van 80 woorden',
			href: '/admin/werkgebied'
		},
		{ count: projects.length, label: 'realisaties in ontwerp', href: '/admin/realisaties' }
	].filter((g) => g.count > 0);
	return {
		changes: changes.slice(0, 12).map((c) => ({
			label: c.label,
			action: c.action,
			table: TABLE_LABELS[c.owner_table] ?? c.owner_table,
			at: c.changed_at.toISOString()
		})),
		changeCount: changes.length,
		builds: builds.map((b) => ({
			status: b.status,
			trigger: b.trigger,
			at: b.triggered_at.toISOString(),
			detail: b.detail
		})),
		requests: requests.map((r) => ({
			id: r.id,
			kind: r.kind,
			name: [r.first_name, r.last_name].filter(Boolean).join(' '),
			municipality: r.municipality,
			at: r.created_at.toISOString()
		})),
		gaps
	};
};
