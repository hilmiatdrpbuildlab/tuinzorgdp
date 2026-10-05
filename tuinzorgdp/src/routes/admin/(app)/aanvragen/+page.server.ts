import { and, desc, eq, type SQL } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const KINDS = ['offerte', 'vraag'] as const;
const STATUSES = ['nieuw', 'beantwoord', 'gepland', 'archief'] as const;

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals);
	const db = await locals.db();
	const kind = KINDS.find((k) => k === url.searchParams.get('soort')) ?? null;
	const status = STATUSES.find((s) => s === url.searchParams.get('status')) ?? null;
	const where: SQL[] = [];
	if (kind) where.push(eq(schema.requests.kind, kind));
	if (status) where.push(eq(schema.requests.status, status));
	const rows = await db
		.select()
		.from(schema.requests)
		.where(where.length ? and(...where) : undefined)
		.orderBy(desc(schema.requests.created_at))
		.limit(500);
	return {
		kind,
		status,
		requests: rows.map((r) => ({
			id: r.id,
			kind: r.kind,
			status: r.status,
			name: [r.first_name, r.last_name].filter(Boolean).join(' '),
			municipality: r.municipality,
			services: r.services,
			createdAt: r.created_at.toISOString(),
			preview: r.message.slice(0, 120)
		}))
	};
};
