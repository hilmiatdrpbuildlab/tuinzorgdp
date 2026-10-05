import { requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const ORDER = ['home', 'diensten', 'realisaties', 'contact', 'privacy'];
const LABEL: Record<string, string> = {
	home: 'Home',
	diensten: 'Diensten',
	realisaties: 'Realisaties',
	contact: 'Contact',
	privacy: 'Privacybeleid'
};

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const rows = await (await locals.db()).select().from(schema.pages);
	return {
		pages: rows
			.sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
			.map((p) => ({ slug: p.slug, label: LABEL[p.slug] ?? p.slug, title: p.title }))
	};
};
