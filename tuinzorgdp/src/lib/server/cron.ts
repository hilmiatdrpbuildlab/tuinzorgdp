import { eq } from 'drizzle-orm';
import { markChanged, sweepUnusedMedia } from './cms';
import type { Db } from './db/client';
import * as schema from './db/schema';
import { fetchRating } from './google';
import { expireStaleBuilds, triggerPublish } from './publish';
import { purgeOldRequests } from './requests';
import type { Storage } from './storage-core';

/** 03:00: media sweep (unused for 24 hours) and request retention (12 months, with their photos). */
export async function dailyCron(db: Db, store: Storage, now = new Date()) {
	const media = await sweepUnusedMedia(db, store, now);
	const requests = await purgeOldRequests(db, store, now);
	await expireStaleBuilds(db, now);
	return { media, requests };
}

/** 04:30: Google rating; publishes only when a value changed. Returns what it did. */
export async function googleCron(
	db: Db,
	key: string | undefined,
	hookUrl: string | undefined,
	fetcher: typeof fetch = fetch
): Promise<{ changed: boolean; published: boolean; reason?: string }> {
	if (!key)
		return { changed: false, published: false, reason: 'GOOGLE_PLACES_KEY is niet ingesteld' };
	const [s] = await db.select().from(schema.settings).limit(1);
	const placeId = s?.google?.placeId;
	if (!s || !placeId)
		return { changed: false, published: false, reason: 'Geen place id in Instellingen' };
	const result = await fetchRating(placeId, key, fetcher);
	if (!result) return { changed: false, published: false, reason: 'Geen score bij Google' };
	const changed = result.rating !== s.google.rating || result.ratingCount !== s.google.ratingCount;
	await db
		.update(schema.settings)
		.set({
			google: {
				...s.google,
				...result,
				checkedOn: new Date().toISOString().slice(0, 10),
				source: 'places'
			}
		})
		.where(eq(schema.settings.id, true));
	if (!changed) return { changed: false, published: false };
	await markChanged(
		db,
		'settings',
		'google',
		`Google-score ${result.rating} (${result.ratingCount})`
	);
	const { started } = await triggerPublish(db, 'cron', hookUrl, fetcher);
	return { changed: true, published: started };
}
