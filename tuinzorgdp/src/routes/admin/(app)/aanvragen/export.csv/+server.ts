import type { RequestHandler } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { csvCell } from '$lib/csv';

const HEADER = [
	'Ontvangen',
	'Soort',
	'Status',
	'Voornaam',
	'Achternaam',
	'E-mail',
	'Telefoon',
	'Adres',
	'Postcode',
	'Gemeente',
	'Diensten',
	'Timing',
	'Oppervlakte',
	'Bericht'
];

export const GET: RequestHandler = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const rows = await db.select().from(schema.requests).orderBy(desc(schema.requests.created_at));
	const lines = [
		HEADER,
		...rows.map((r) => [
			r.created_at.toISOString(),
			r.kind,
			r.status,
			r.first_name,
			r.last_name,
			r.email,
			r.phone,
			r.street,
			r.postcode,
			r.municipality,
			r.services.join(', '),
			r.timing,
			r.garden_size,
			r.message
		])
	].map((cols) => cols.map(csvCell).join(';'));
	const body = '﻿' + lines.join('\n') + '\n';
	const date = new Date().toISOString().slice(0, 10);
	return new Response(body, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="aanvragen-${date}.csv"`,
			'cache-control': 'no-store'
		}
	});
};
