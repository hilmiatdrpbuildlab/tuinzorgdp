import { error, fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { adminSrc } from '$lib/server/admin-media';
import { TABLE_LABELS, deleteIfUnused, markChanged, requireUser, usagesOf } from '$lib/server/cms';
import type { Db } from '$lib/server/db/client';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { storage } from '$lib/server/storage';
import type { Actions, PageServerLoad } from './$types';

/** The Dutch name of a usage field; unknown fields show as stored. */
const FIELD_LABELS: Record<string, string> = {
	cover: 'omslagfoto',
	hero: 'hoofdfoto',
	photos: "foto's",
	gallery: 'galerij',
	media: 'foto'
};

type Usage = { label: string; href: string | null };

/** "Diensten · omslagfoto · Snoeien", with a link to the editor when there is one. */
async function describeUsages(db: Db, mediaIds: string[]): Promise<Map<string, Usage[]>> {
	const usages = await usagesOf(db, mediaIds);
	// Owner names are a handful of small tables; reading them whole is cheaper than one query per usage.
	const [pages, services, projects, areas, reviews] = await Promise.all([
		db
			.select({ id: schema.pages.id, name: schema.pages.title, slug: schema.pages.slug })
			.from(schema.pages),
		db.select({ id: schema.services.id, name: schema.services.title }).from(schema.services),
		db.select({ id: schema.projects.id, name: schema.projects.title }).from(schema.projects),
		db
			.select({ id: schema.serviceAreas.id, name: schema.serviceAreas.name })
			.from(schema.serviceAreas),
		db.select({ id: schema.reviews.id, name: schema.reviews.author_name }).from(schema.reviews)
	]);
	const owners: Record<string, Map<string, { name: string; href: string | null }>> = {
		pages: new Map(pages.map((p) => [p.id, { name: p.name, href: `/admin/paginas/${p.slug}` }])),
		services: new Map(
			services.map((s) => [s.id, { name: s.name, href: `/admin/diensten/${s.id}` }])
		),
		projects: new Map(
			projects.map((p) => [p.id, { name: p.name, href: `/admin/realisaties/${p.id}` }])
		),
		project_media: new Map(
			projects.map((p) => [p.id, { name: p.name, href: `/admin/realisaties/${p.id}` }])
		),
		service_areas: new Map(
			areas.map((a) => [a.id, { name: a.name, href: `/admin/werkgebied/${a.id}` }])
		),
		reviews: new Map(reviews.map((r) => [r.id, { name: r.name, href: '/admin/reviews' }]))
	};
	const out = new Map<string, Usage[]>();
	for (const u of usages) {
		const owner = owners[u.owner_table]?.get(u.owner_id);
		const label = [
			TABLE_LABELS[u.owner_table] ?? u.owner_table,
			FIELD_LABELS[u.field] ?? u.field,
			owner?.name
		]
			.filter(Boolean)
			.join(' · ');
		const list = out.get(u.media_id) ?? [];
		list.push({ label, href: owner?.href ?? null });
		out.set(u.media_id, list);
	}
	return out;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals);
	const db = await locals.db();
	const filter = url.searchParams.get('filter');
	const rows = await db.select().from(schema.media).orderBy(desc(schema.media.created_at));
	const usages = await describeUsages(
		db,
		rows.map((m) => m.id)
	);
	const items = rows.map((m) => ({
		id: m.id,
		src: adminSrc(m.id),
		fileName: m.file_name,
		width: m.width,
		height: m.height,
		bytes: m.bytes,
		alt: m.alt,
		usages: usages.get(m.id) ?? []
	}));
	const counts = {
		all: items.length,
		alt: items.filter((m) => !m.alt.trim()).length,
		unused: items.filter((m) => !m.usages.length).length
	};
	const shown =
		filter === 'alt'
			? items.filter((m) => !m.alt.trim())
			: filter === 'unused'
				? items.filter((m) => !m.usages.length)
				: items;
	return { items: shown, counts, filter: filter === 'alt' || filter === 'unused' ? filter : 'all' };
};

export const actions: Actions = {
	alt: async ({ request, locals }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const id = f.id('id');
		if (!id) error(404, 'Niet gevonden');
		const alt = f.str('alt');
		const errors: Record<string, string> = {};
		if (alt.length > 300) errors.alt = 'Maximaal 300 tekens.';
		if (Object.keys(errors).length)
			return fail(400, { errors, message: 'Controleer de alt-tekst.' });
		const db = await locals.db();
		const [m] = await db
			.update(schema.media)
			.set({ alt })
			.where(eq(schema.media.id, id))
			.returning({ file_name: schema.media.file_name });
		if (!m) error(404, 'Niet gevonden');
		await markChanged(db, 'media', id, `Alt-tekst ${m.file_name}`);
		return { saved: true };
	},
	delete: async ({ request, locals }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const id = f.id('id');
		if (!id) error(404, 'Niet gevonden');
		const db = await locals.db();
		const [m] = await db.select().from(schema.media).where(eq(schema.media.id, id));
		if (!m) error(404, 'Niet gevonden');
		const used = (await describeUsages(db, [id])).get(id) ?? [];
		if (used.length) {
			return fail(400, {
				errors: {},
				message: `"${m.file_name}" wordt nog gebruikt in: ${used.map((u) => u.label).join('; ')}. Haal de foto daar eerst weg.`
			});
		}
		const deleted = await deleteIfUnused(db, await storage(), [id]);
		if (!deleted)
			return fail(400, { errors: {}, message: 'Verwijderen is niet gelukt. Probeer opnieuw.' });
		await markChanged(db, 'media', id, `Foto ${m.file_name}`, 'verwijderd');
		return { saved: true };
	}
};
