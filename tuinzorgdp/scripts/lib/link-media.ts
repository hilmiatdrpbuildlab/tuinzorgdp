/**
 * Links imported seed photos to the content: service covers, the home hero and about photos, the
 * contact photo, and one draft project per photo group. Writes media_usages like the CMS does.
 */
import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { Db } from '../../src/lib/server/db/client';
import * as schema from '../../src/lib/server/db/schema';
import { mediaId, seedPages, seedProjects, seedServices } from '../../src/lib/server/seed-data';

async function setUsages(
	db: Db,
	owner_table: string,
	owner_id: string,
	fields: { field: string; mediaId: string | null }[]
) {
	await db
		.delete(schema.mediaUsages)
		.where(
			and(
				eq(schema.mediaUsages.owner_table, owner_table),
				eq(schema.mediaUsages.owner_id, owner_id)
			)
		);
	const rows = fields
		.filter((f): f is { field: string; mediaId: string } => !!f.mediaId)
		.map((f) => ({ media_id: f.mediaId, owner_table, owner_id, field: f.field }));
	if (rows.length) await db.insert(schema.mediaUsages).values(rows).onConflictDoNothing();
}

export async function linkSeedMedia(db: Db, force = false): Promise<number> {
	const present = new Set(
		(await db.select({ id: schema.media.id }).from(schema.media)).map((m) => m.id)
	);
	const has = (file: string | null) => (file && present.has(mediaId(file)) ? mediaId(file) : null);
	let n = 0;

	for (const s of seedServices) {
		const id = has(s.cover);
		if (!id) continue;
		const where = force
			? eq(schema.services.id, s.id)
			: and(eq(schema.services.id, s.id), isNull(schema.services.cover_media_id));
		const res = await db
			.update(schema.services)
			.set({ cover_media_id: id })
			.where(where)
			.returning({ id: schema.services.id });
		if (res.length) {
			await setUsages(db, 'services', s.id, [{ field: 'cover', mediaId: id }]);
			n++;
		}
	}

	for (const p of seedPages) {
		const heroId = has(p.hero);
		const [row] = await db.select().from(schema.pages).where(eq(schema.pages.id, p.id));
		if (!row) continue;
		const aboutIds =
			p.slug === 'home'
				? ((row.blocks as { about?: { mediaIds?: string[] } }).about?.mediaIds ?? []).filter((id) =>
						present.has(id)
					)
				: [];
		if (heroId && (force || !row.hero_media_id)) {
			await db.update(schema.pages).set({ hero_media_id: heroId }).where(eq(schema.pages.id, p.id));
			n++;
		}
		const hero = force || !row.hero_media_id ? heroId : row.hero_media_id;
		await setUsages(db, 'pages', p.id, [
			{ field: 'hero', mediaId: hero },
			...aboutIds.map((id) => ({ field: 'about', mediaId: id }))
		]);
	}

	for (const p of seedProjects) {
		const photos = p.photos.filter((ph) => present.has(ph.media_id));
		if (!photos.length) continue;
		const inserted = await db
			.insert(schema.projects)
			.values({
				id: p.id,
				slug: p.slug,
				title: p.title,
				service_id: p.service_id,
				summary: p.summary,
				cover_media_id: present.has(p.cover_media_id) ? p.cover_media_id : photos[0].media_id,
				sort_order: p.sort_order,
				is_published: false
			})
			.onConflictDoNothing()
			.returning({ id: schema.projects.id });
		if (!inserted.length && !force) continue;
		const existing = await db
			.select({ media_id: schema.projectMedia.media_id })
			.from(schema.projectMedia)
			.where(
				and(
					eq(schema.projectMedia.project_id, p.id),
					inArray(
						schema.projectMedia.media_id,
						photos.map((x) => x.media_id)
					)
				)
			);
		const have = new Set(existing.map((e) => e.media_id));
		const fresh = photos.filter((ph) => !have.has(ph.media_id));
		if (fresh.length) {
			await db.insert(schema.projectMedia).values(
				fresh.map((ph) => ({
					id: ph.id,
					project_id: p.id,
					media_id: ph.media_id,
					role: ph.role,
					in_home_gallery: ph.in_home_gallery,
					sort_order: ph.sort_order
				}))
			);
		}
		const [proj] = await db.select().from(schema.projects).where(eq(schema.projects.id, p.id));
		await setUsages(db, 'projects', p.id, [
			{ field: 'cover', mediaId: proj?.cover_media_id ?? null },
			...photos.map((ph) => ({ field: 'photos', mediaId: ph.media_id }))
		]);
		n++;
	}
	return n;
}
