import { and, count, desc, eq } from 'drizzle-orm';
import { requireUser, unpublishedChanges } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { activeBuild, expireStaleBuilds } from '$lib/server/publish';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const db = await locals.db();
	await expireStaleBuilds(db);
	const [changes, active, [last], [{ n: newRequests }]] = await Promise.all([
		unpublishedChanges(db),
		activeBuild(db),
		db.select().from(schema.builds).orderBy(desc(schema.builds.triggered_at)).limit(1),
		db
			.select({ n: count() })
			.from(schema.requests)
			.where(and(eq(schema.requests.status, 'nieuw')))
	]);
	return {
		user,
		publish: {
			count: changes.length,
			active: active ? { id: active.id, triggeredAt: active.triggered_at.toISOString() } : null,
			lastFailed: !active && last?.status === 'failed' ? { detail: last.detail } : null
		},
		newRequests
	};
};
