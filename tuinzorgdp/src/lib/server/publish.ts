/**
 * Publiceren (docs/cms-plan/07-build-and-deploy.md): a builds row, then the Workers Builds deploy
 * hook. A second trigger while one is queued returns the queued build instead of starting another.
 */
import { and, desc, eq, gt, inArray } from 'drizzle-orm';
import type { Db } from './db/client';
import * as schema from './db/schema';

export const BUILD_TIMEOUT_MS = 15 * 60 * 1000;

export type BuildRow = typeof schema.builds.$inferSelect;

export async function activeBuild(db: Db, now = new Date()): Promise<BuildRow | null> {
	const [row] = await db
		.select()
		.from(schema.builds)
		.where(
			and(
				inArray(schema.builds.status, ['pending', 'building']),
				gt(schema.builds.triggered_at, new Date(now.getTime() - BUILD_TIMEOUT_MS))
			)
		)
		.orderBy(desc(schema.builds.triggered_at))
		.limit(1);
	return row ?? null;
}

/** Marks builds that never showed up on the live site within 15 minutes as failed. */
export async function expireStaleBuilds(db: Db, now = new Date()) {
	const stale = await db
		.select({ id: schema.builds.id, triggered_at: schema.builds.triggered_at })
		.from(schema.builds)
		.where(inArray(schema.builds.status, ['pending', 'building']));
	for (const b of stale) {
		if (now.getTime() - b.triggered_at.getTime() > BUILD_TIMEOUT_MS) {
			await db
				.update(schema.builds)
				.set({
					status: 'failed',
					finished_at: now,
					detail: 'Geen nieuwe versie live na 15 minuten.'
				})
				.where(eq(schema.builds.id, b.id));
		}
	}
}

export async function triggerPublish(
	db: Db,
	trigger: 'cms' | 'cron',
	hookUrl: string | undefined,
	fetcher: typeof fetch = fetch
): Promise<{ build: BuildRow; started: boolean }> {
	await expireStaleBuilds(db);
	const queued = await activeBuild(db);
	if (queued) return { build: queued, started: false };

	const [build] = await db.insert(schema.builds).values({ trigger, status: 'pending' }).returning();
	if (!hookUrl) {
		const [failed] = await db
			.update(schema.builds)
			.set({
				status: 'failed',
				finished_at: new Date(),
				detail:
					'Publiceren is nog niet gekoppeld aan Cloudflare (DEPLOY_HOOK_URL ontbreekt). Uw wijzigingen zijn bewaard; DRP BuildLab zet ze online.'
			})
			.where(eq(schema.builds.id, build.id))
			.returning();
		return { build: failed, started: false };
	}
	try {
		const res = await fetcher(hookUrl, { method: 'POST' });
		if (!res.ok) throw new Error(`Deploy hook antwoordde ${res.status}`);
		return { build, started: true };
	} catch (e) {
		const [failed] = await db
			.update(schema.builds)
			.set({ status: 'failed', finished_at: new Date(), detail: (e as Error).message })
			.where(eq(schema.builds.id, build.id))
			.returning();
		return { build: failed, started: false };
	}
}

/** Called by the CMS once it has seen the publish id in the live build-info.json. */
export async function markSeenLive(db: Db, publishId: string) {
	await db
		.update(schema.builds)
		.set({ status: 'live', finished_at: new Date() })
		.where(
			and(eq(schema.builds.id, publishId), inArray(schema.builds.status, ['pending', 'building']))
		);
}
