import { inArray } from 'drizzle-orm';
import type { AdminMedia } from '$lib/client/upload';
import type { Db } from './db/client';
import * as schema from './db/schema';

export type MediaRow = typeof schema.media.$inferSelect;

/** Inside /admin, photos are served from the bucket through a session-checked route. */
export const adminSrc = (id: string) => `/admin/api/media/${id}/file`;

export function toAdminMedia(m: MediaRow | null | undefined): AdminMedia | null {
	if (!m) return null;
	return { id: m.id, src: adminSrc(m.id), alt: m.alt, width: m.width, height: m.height };
}

export async function mediaMap(db: Db, ids: (string | null | undefined)[]) {
	const list = [...new Set(ids.filter((x): x is string => !!x))];
	if (!list.length) return new Map<string, MediaRow>();
	const rows = await db.select().from(schema.media).where(inArray(schema.media.id, list));
	return new Map(rows.map((r) => [r.id, r]));
}
