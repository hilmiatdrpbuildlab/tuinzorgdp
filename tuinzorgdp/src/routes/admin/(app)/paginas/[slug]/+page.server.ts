import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { HomeBlocks } from '$lib/content/types';
import { seoGuards } from '$lib/rules';
import { mediaMap, toAdminMedia } from '$lib/server/admin-media';
import { markChanged, requireUser, syncUsages } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { BLOCK_SCHEMAS } from '$lib/server/page-blocks';
import { dbMessage, saveTx } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [page] = await db.select().from(schema.pages).where(eq(schema.pages.slug, params.slug));
	if (!page) error(404, 'Niet gevonden');
	const blocks = page.blocks as Partial<HomeBlocks>;
	const aboutIds = blocks.about?.mediaIds ?? [];
	const media = await mediaMap(db, [page.hero_media_id, ...aboutIds]);
	return {
		page,
		hero: toAdminMedia(media.get(page.hero_media_id ?? '')),
		about: [0, 1].map((i) => toAdminMedia(media.get(aboutIds[i] ?? '')))
	};
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireUser(locals);
		const form = await request.formData();
		const f = fields(form);
		const db = await locals.db();
		const [page] = await db.select().from(schema.pages).where(eq(schema.pages.slug, params.slug));
		if (!page) error(404, 'Niet gevonden');

		const values = {
			title: f.str('title'),
			intro: f.opt('intro'),
			body: f.opt('body'),
			hero_media_id: f.id('hero'),
			noindex: f.bool('noindex'),
			seo_title: f.opt('seo_title'),
			meta_description: f.opt('meta_description'),
			blocks: page.blocks
		};
		const errors: Record<string, string> = {};
		if (!values.title) errors.title = 'Vul een titel in.';

		const schemaFor = BLOCK_SCHEMAS[params.slug];
		if (schemaFor) {
			const perks = f
				.list('perk_title')
				.map((title, i) => ({ title, text: f.list('perk_text')[i] ?? '' }));
			const candidate = {
				hero: {
					title: f.str('hero_title'),
					accentWord: f.str('hero_accent'),
					lead: f.str('hero_lead'),
					usps: form
						.getAll('usp')
						.map(String)
						.map((s) => s.trim())
				},
				about: {
					eyebrow: f.str('about_eyebrow'),
					title: f.str('about_title'),
					accentWord: f.str('about_accent'),
					lead: f.str('about_lead'),
					perks,
					mediaIds: [f.id('about_photo_1'), f.id('about_photo_2')].filter((x): x is string => !!x)
				},
				cta: { title: f.str('cta_title'), accentWord: f.str('cta_accent'), lead: f.str('cta_lead') }
			};
			const parsed = schemaFor.safeParse(candidate);
			if (!parsed.success) {
				for (const issue of parsed.error.issues) errors[issue.path.join('.')] ??= issue.message;
			} else {
				values.blocks = parsed.data as Record<string, unknown>;
			}
		}

		const guards = seoGuards(values);
		if (Object.keys(errors).length || guards.length)
			return fail(400, { errors, guards, message: 'Controleer de velden.' });

		const blocks = values.blocks as Partial<HomeBlocks>;
		try {
			await saveTx(db, async (tx) => {
				await tx.update(schema.pages).set(values).where(eq(schema.pages.id, page.id));
				await markChanged(tx, 'pages', page.id, `Pagina ${values.title}`);
				return syncUsages(tx, 'pages', page.id, [
					{ field: 'hero', mediaId: values.hero_media_id },
					...(blocks.about?.mediaIds ?? []).map((id) => ({ field: 'about', mediaId: id }))
				]);
			});
		} catch (e) {
			return fail(400, { errors: {}, guards: [], message: dbMessage(e) });
		}
		return { saved: true };
	}
};
