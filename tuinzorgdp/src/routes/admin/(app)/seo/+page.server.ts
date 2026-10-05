import { error, fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { LIMITS } from '$lib/rules';
import { seoTitle } from '$lib/seo';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { plainText } from '$lib/server/markdown';
import { dbMessage } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

/** The names the public routes use when a page has no SEO title (src/lib/server/page-data.ts). */
const PAGE_NAMES: Record<string, string> = {
	home: 'Tuinonderhoud met passie',
	diensten: 'Diensten',
	realisaties: 'Realisaties',
	contact: 'Contact en gratis offerte'
};

type Check = { length: number; problem: 'empty' | 'long' | null };

/** The title and description the page gets, measured against 62 / 158. Typed text over the limit is cut on the site. */
function row(o: {
	kind: string;
	name: string;
	path: string;
	edit: string;
	hidden?: boolean;
	seo_title: string | null;
	meta_description: string | null;
	fallbackName: string;
	fallbackDescription: string;
}) {
	const title = o.seo_title?.trim() ? o.seo_title : seoTitle(null, o.fallbackName);
	const description =
		(o.meta_description?.trim()
			? o.meta_description
			: o.fallbackDescription.replace(/\s+/g, ' ').trim()) ?? '';
	const check = (text: string, max: number): Check => ({
		length: text.length,
		problem: !text.trim() ? 'empty' : text.length > max ? 'long' : null
	});
	return {
		kind: o.kind,
		name: o.name,
		path: o.path,
		edit: o.edit,
		hidden: o.hidden ?? false,
		title,
		titleCustom: !!o.seo_title?.trim(),
		titleCheck: check(title, LIMITS.seoTitle),
		description,
		descriptionCustom: !!o.meta_description?.trim(),
		descriptionCheck: check(description, LIMITS.metaDescription)
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const [pages, services, projects, areas, redirects] = await Promise.all([
		db.select().from(schema.pages).orderBy(asc(schema.pages.slug)),
		db.select().from(schema.services).orderBy(asc(schema.services.sort_order)),
		db.select().from(schema.projects).orderBy(asc(schema.projects.sort_order)),
		db.select().from(schema.serviceAreas).orderBy(asc(schema.serviceAreas.sort_order)),
		db.select().from(schema.redirects).orderBy(asc(schema.redirects.from_path))
	]);
	const serviceById = new Map(services.map((s) => [s.id, s]));
	const areaById = new Map(areas.map((a) => [a.id, a]));
	const order = ['home', 'diensten', 'realisaties', 'contact'];
	const sortedPages = [...pages].sort(
		(a, b) => (order.indexOf(a.slug) + 1 || 99) - (order.indexOf(b.slug) + 1 || 99)
	);

	const rows = [
		...sortedPages.map((p) => {
			const hero = (p.blocks as { hero?: { lead?: string } }).hero;
			return row({
				kind: 'Pagina',
				name: p.slug === 'home' ? 'Home' : p.title,
				path: p.slug === 'home' ? '/' : `/${p.slug}`,
				edit: `/admin/paginas/${p.slug}`,
				hidden: p.noindex,
				seo_title: p.seo_title,
				meta_description: p.meta_description,
				fallbackName: PAGE_NAMES[p.slug] ?? p.title,
				fallbackDescription:
					p.slug === 'home'
						? (hero?.lead ?? '')
						: PAGE_NAMES[p.slug]
							? (p.intro ?? '')
							: (p.intro ?? p.title)
			});
		}),
		...services.map((s) =>
			row({
				kind: 'Dienst',
				name: s.title,
				path: `/diensten/${s.slug}`,
				edit: `/admin/diensten/${s.id}`,
				hidden: !s.is_published,
				seo_title: s.seo_title,
				meta_description: s.meta_description,
				fallbackName: s.title,
				fallbackDescription: s.summary
			})
		),
		...projects.map((p) => {
			const service = serviceById.get(p.service_id);
			const area = p.service_area_id ? areaById.get(p.service_area_id) : undefined;
			return row({
				kind: 'Realisatie',
				name: p.title,
				path: `/realisaties/${p.slug}`,
				edit: `/admin/realisaties/${p.id}`,
				hidden: !p.is_published,
				seo_title: p.seo_title,
				meta_description: p.meta_description,
				fallbackName: p.title,
				fallbackDescription: `${p.title}: ${(service?.title ?? '').toLowerCase()} door TuinZorg DP${area ? ` in ${area.name}` : ''}. ${p.summary ?? ''}`
			});
		}),
		...areas.map((a) =>
			row({
				kind: 'Werkgebied',
				name: a.name,
				path: `/tuinonderhoud/${a.slug}`,
				edit: `/admin/werkgebied/${a.id}`,
				hidden: !a.is_published,
				seo_title: a.seo_title,
				meta_description: a.meta_description,
				fallbackName: `Tuinonderhoud in ${a.name}`,
				fallbackDescription: plainText(a.intro)
			})
		)
	];

	return {
		rows,
		problems: rows.filter((r) => !r.hidden && (r.titleCheck.problem || r.descriptionCheck.problem))
			.length,
		redirects: redirects.map((r) => ({
			id: r.id,
			from: r.from_path,
			to: r.to_path,
			status: r.status,
			note: r.note
		})),
		limits: { title: LIMITS.seoTitle, description: LIMITS.metaDescription }
	};
};

/** A site path: starts with one "/", no spaces, no host. */
const isPath = (p: string) => /^\/(?!\/)\S*$/.test(p);

export const actions: Actions = {
	add: async ({ request, locals }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const from_path = f.str('from_path');
		const to_path = f.str('to_path');
		const status = f.int('status', 301);
		const note = f.opt('note');

		const errors: Record<string, string> = {};
		if (!from_path) errors.from_path = 'Vul het oude adres in.';
		else if (!isPath(from_path))
			errors.from_path = 'Het oude adres begint met "/", bijvoorbeeld /oude-pagina.';
		if (!to_path) errors.to_path = 'Vul het nieuwe adres in.';
		else if (!isPath(to_path))
			errors.to_path = 'Het nieuwe adres begint met "/", bijvoorbeeld /realisaties.';
		else if (to_path === from_path)
			errors.to_path = 'Het nieuwe adres moet verschillen van het oude.';
		if (status !== 301 && status !== 302) errors.status = 'Kies 301 of 302.';
		if (Object.keys(errors).length)
			return fail(400, { errors, message: 'Controleer de doorverwijzing.' });

		const db = await locals.db();
		const [exists] = await db
			.select({ id: schema.redirects.id })
			.from(schema.redirects)
			.where(eq(schema.redirects.from_path, from_path));
		if (exists)
			return fail(400, {
				errors: { from_path: 'Voor dit adres bestaat al een doorverwijzing.' },
				message: 'Controleer de doorverwijzing.'
			});
		try {
			await db.insert(schema.redirects).values({ from_path, to_path, status, note });
			await markChanged(db, 'redirects', from_path, `Doorverwijzing ${from_path}`, 'toegevoegd');
		} catch (e) {
			return fail(400, { errors: {}, message: dbMessage(e) });
		}
		return { saved: true };
	},
	delete: async ({ request, locals }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const id = f.id('id');
		if (!id) error(404, 'Niet gevonden');
		const db = await locals.db();
		const [r] = await db.delete(schema.redirects).where(eq(schema.redirects.id, id)).returning();
		if (!r) error(404, 'Niet gevonden');
		await markChanged(db, 'redirects', r.from_path, `Doorverwijzing ${r.from_path}`, 'verwijderd');
		return { saved: true };
	}
};
