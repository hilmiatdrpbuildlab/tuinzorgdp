import { json, type RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/cms';
import { env } from '$lib/server/env';
import { markSeenLive, triggerPublish } from '$lib/server/publish';

/**
 * Publiceren. Lives under /admin because the session cookie is scoped to /admin; the deploy hook URL
 * stays on the server.
 */
export const POST: RequestHandler = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const { build, started } = await triggerPublish(db, 'cms', env('DEPLOY_HOOK_URL'));
	return json({
		started,
		build: {
			id: build.id,
			status: build.status,
			triggeredAt: build.triggered_at.toISOString(),
			detail: build.detail
		}
	});
};

/** The banner saw this publish id in the live build-info.json. */
export const PATCH: RequestHandler = async ({ locals, request }) => {
	requireUser(locals);
	const { id } = (await request.json().catch(() => ({}))) as { id?: string };
	if (typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id))
		await markSeenLive(await locals.db(), id);
	return json({ ok: true });
};
