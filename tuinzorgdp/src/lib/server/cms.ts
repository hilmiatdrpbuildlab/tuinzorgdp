/**
 * Shared CMS server logic: the session re-check every mutation runs, the change log behind the
 * publish banner, media usages and the deletion rule (docs/cms-plan/04-media.md), and slug redirects.
 */
import { error } from '@sveltejs/kit';
import { and, count, desc, eq, gt, inArray, lt, notExists, sql } from 'drizzle-orm';
import { slugRedirect } from '$lib/rules';
import type { Db } from './db/client';
import * as schema from './db/schema';
import type { Storage } from './storage-core';

/** Every CMS form action and endpoint calls this, not only the layout. */
export function requireUser(locals: App.Locals) {
	if (!locals.user) error(401, 'Niet aangemeld');
	return locals.user;
}

export async function markChanged(
	db: Db,
	owner_table: string,
	owner_id: string,
	label: string,
	action: 'opgeslagen' | 'verwijderd' | 'toegevoegd' = 'opgeslagen'
) {
	await db.insert(schema.contentChanges).values({ owner_table, owner_id, label, action });
}

export async function lastLiveBuild(db: Db) {
	const [row] = await db
		.select()
		.from(schema.builds)
		.where(eq(schema.builds.status, 'live'))
		.orderBy(desc(schema.builds.triggered_at))
		.limit(1);
	return row ?? null;
}

/** Changes not yet live: distinct items changed after the last live build was started. */
export async function unpublishedChanges(db: Db) {
	const live = await lastLiveBuild(db);
	const since = live?.triggered_at ?? new Date(0);
	const rows = await db
		.select()
		.from(schema.contentChanges)
		.where(gt(schema.contentChanges.changed_at, since))
		.orderBy(desc(schema.contentChanges.changed_at));
	const seen = new Map<string, (typeof rows)[number]>();
	for (const r of rows) {
		const k = `${r.owner_table}:${r.owner_id}`;
		if (!seen.has(k)) seen.set(k, r);
	}
	return [...seen.values()];
}

// ---------------------------------------------------------------- media usages

export type UsageField = { field: string; mediaId: string | null | undefined };

/**
 * Rewrites the usages of one content row and returns the media ids it no longer uses.
 * Call inside the same transaction as the save; then pass the ids to deleteIfUnused.
 */
export async function syncUsages(
	db: Db,
	owner_table: string,
	owner_id: string,
	fields: UsageField[]
) {
	const before = await db
		.select({ media_id: schema.mediaUsages.media_id })
		.from(schema.mediaUsages)
		.where(
			and(
				eq(schema.mediaUsages.owner_table, owner_table),
				eq(schema.mediaUsages.owner_id, owner_id)
			)
		);
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
	const unique = rows.filter(
		(r, i) => rows.findIndex((x) => x.media_id === r.media_id && x.field === r.field) === i
	);
	if (unique.length) await db.insert(schema.mediaUsages).values(unique);
	const now = new Set(unique.map((r) => r.media_id));
	return [...new Set(before.map((b) => b.media_id))].filter((id) => !now.has(id));
}

export async function removeUsages(db: Db, owner_table: string, owner_id: string) {
	return syncUsages(db, owner_table, owner_id, []);
}

/** Deletes each file that no row uses any more: the object first, then its media row. */
export async function deleteIfUnused(db: Db, store: Storage, ids: string[]): Promise<number> {
	let deleted = 0;
	for (const id of ids) {
		const [{ n }] = await db
			.select({ n: count() })
			.from(schema.mediaUsages)
			.where(eq(schema.mediaUsages.media_id, id));
		if (n > 0) continue;
		const [m] = await db.select().from(schema.media).where(eq(schema.media.id, id));
		if (!m) continue;
		try {
			await clearDirectReferences(db, id);
			if (!m.object_key.startsWith('ds:')) await store.delete(m.object_key);
			await db.delete(schema.media).where(eq(schema.media.id, id));
			deleted++;
		} catch (e) {
			console.error('[media] could not delete', id, e);
		}
	}
	return deleted;
}

/** Foreign keys that point at a file which is about to go (they are already out of media_usages). */
async function clearDirectReferences(db: Db, id: string) {
	await db
		.update(schema.services)
		.set({ cover_media_id: null })
		.where(eq(schema.services.cover_media_id, id));
	await db
		.update(schema.projects)
		.set({ cover_media_id: null })
		.where(eq(schema.projects.cover_media_id, id));
	await db
		.update(schema.pages)
		.set({ hero_media_id: null })
		.where(eq(schema.pages.hero_media_id, id));
	await db
		.update(schema.socialPosts)
		.set({ media_id: null })
		.where(eq(schema.socialPosts.media_id, id));
	await db.delete(schema.projectMedia).where(eq(schema.projectMedia.media_id, id));
}

/** The daily sweep: uploads that were never saved into any row, older than 24 hours. */
export async function sweepUnusedMedia(db: Db, store: Storage, now = new Date()): Promise<number> {
	const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const rows = await db
		.select({ id: schema.media.id })
		.from(schema.media)
		.where(
			and(
				lt(schema.media.updated_at, cutoff),
				notExists(
					db
						.select({ x: sql`1` })
						.from(schema.mediaUsages)
						.where(eq(schema.mediaUsages.media_id, schema.media.id))
				)
			)
		);
	return deleteIfUnused(
		db,
		store,
		rows.map((r) => r.id)
	);
}

export async function usagesOf(db: Db, mediaIds: string[]) {
	if (!mediaIds.length) return [];
	return db.select().from(schema.mediaUsages).where(inArray(schema.mediaUsages.media_id, mediaIds));
}

// ---------------------------------------------------------------- slugs

/** A changed slug writes a redirect from the old path, and points older redirects at the new one. */
export async function recordSlugChange(db: Db, prefix: string, oldSlug: string, newSlug: string) {
	const r = slugRedirect(prefix, oldSlug, newSlug);
	if (!r) return;
	await db.delete(schema.redirects).where(eq(schema.redirects.from_path, r.to_path));
	await db
		.update(schema.redirects)
		.set({ to_path: r.to_path })
		.where(eq(schema.redirects.to_path, r.from_path));
	await db
		.insert(schema.redirects)
		.values({ ...r, note: 'Automatisch: slug gewijzigd' })
		.onConflictDoUpdate({
			target: schema.redirects.from_path,
			set: { to_path: r.to_path, status: 301 }
		});
	await markChanged(db, 'redirects', r.from_path, `Doorverwijzing ${r.from_path}`);
}

/** The labels the CMS shows for each owner table in usages and the change list. */
export const TABLE_LABELS: Record<string, string> = {
	pages: "Pagina's",
	services: 'Diensten',
	projects: 'Realisaties',
	project_media: 'Realisaties',
	reviews: 'Reviews',
	faqs: 'FAQ',
	service_areas: 'Werkgebied',
	social_posts: 'Social',
	media: 'Media',
	settings: 'Instellingen',
	redirects: 'Doorverwijzingen'
};
