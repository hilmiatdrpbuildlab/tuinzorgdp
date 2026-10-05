import type { IconName } from '$lib/icons/icons';
import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { deleteRequest } from '$lib/server/requests';
import { storage } from '$lib/server/storage';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['nieuw', 'beantwoord', 'gepland', 'archief'] as const;
/** Signed URLs for the garden photos stop working after 5 minutes. */
const SIGNED_SECONDS = 300;

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [r] = await db.select().from(schema.requests).where(eq(schema.requests.id, params.id));
	if (!r) error(404, 'Niet gevonden');
	const [files, services] = await Promise.all([
		db
			.select()
			.from(schema.requestFiles)
			.where(eq(schema.requestFiles.request_id, r.id))
			.orderBy(asc(schema.requestFiles.object_key)),
		db
			.select({
				slug: schema.services.slug,
				title: schema.services.title,
				icon: schema.services.icon
			})
			.from(schema.services)
	]);
	const store = await storage();
	const photos = await Promise.all(
		files.map(async (f) => ({ id: f.id, url: await store.signedUrl(f.object_key, SIGNED_SECONDS) }))
	);
	return {
		request: {
			...r,
			created_at: r.created_at.toISOString(),
			consent_at: r.consent_at?.toISOString() ?? null
		},
		tiles: r.services.map((slug) => {
			const s = services.find((x) => x.slug === slug);
			return {
				slug,
				label: s?.title ?? (slug === 'anders' ? 'Anders' : slug),
				icon: (s?.icon ?? 'sprout') as IconName
			};
		}),
		photos,
		expiresAt: new Date(Date.now() + SIGNED_SECONDS * 1000).toISOString()
	};
};

export const actions: Actions = {
	status: async ({ request, locals, params }) => {
		requireUser(locals);
		const status = fields(await request.formData()).str('status');
		const valid = STATUSES.find((s) => s === status);
		if (!valid) return fail(400, { message: 'Kies een status.' });
		const db = await locals.db();
		await db
			.update(schema.requests)
			.set({ status: valid })
			.where(eq(schema.requests.id, params.id));
		return { saved: true };
	},
	delete: async ({ locals, params }) => {
		requireUser(locals);
		await deleteRequest(await locals.db(), await storage(), params.id);
		redirect(303, '/admin/aanvragen');
	}
};
