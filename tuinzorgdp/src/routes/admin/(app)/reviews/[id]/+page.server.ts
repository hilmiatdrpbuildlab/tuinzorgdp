import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { reviewGuards, type Guard } from '$lib/rules';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { dbMessage, saveTx } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [review] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, params.id));
	if (!review) error(404, 'Niet gevonden');
	const services = await db
		.select({ id: schema.services.id, title: schema.services.title })
		.from(schema.services)
		.orderBy(asc(schema.services.sort_order));
	return { review, services };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const db = await locals.db();
		const [current] = await db
			.select()
			.from(schema.reviews)
			.where(eq(schema.reviews.id, params.id));
		if (!current) error(404, 'Niet gevonden');

		const values = {
			quote: f.str('quote'),
			author_name: f.str('author_name'),
			place: f.opt('place'),
			service_id: f.id('service_id'),
			rating: Math.min(5, Math.max(1, f.int('rating', 5))),
			source: f.str('source') === 'google' ? ('google' as const) : ('direct' as const),
			source_url: f.opt('source_url'),
			reviewed_on: f.date('reviewed_on'),
			consent_confirmed: f.bool('consent_confirmed'),
			is_published: f.bool('is_published')
		};

		const errors: Record<string, string> = {};
		if (!values.quote) errors.quote = 'Vul de tekst van de review in.';
		if (!values.author_name) errors.author_name = 'Vul de naam van de klant in.';
		if (values.source_url && !/^https?:\/\//.test(values.source_url))
			errors.source_url = 'Een link begint met https://.';
		// Publishing guard: the client confirms consent before a review goes on the site.
		const guards: Guard[] = values.is_published ? reviewGuards(values) : [];
		if (Object.keys(errors).length || guards.length)
			return fail(400, {
				errors,
				guards,
				message: guards.length && !Object.keys(errors).length ? undefined : 'Controleer de velden.'
			});

		try {
			await saveTx(db, async (tx) => {
				await tx.update(schema.reviews).set(values).where(eq(schema.reviews.id, params.id));
				await markChanged(tx, 'reviews', params.id, `Review ${values.author_name}`);
			});
		} catch (e) {
			return fail(400, { errors: {}, guards: [], message: dbMessage(e) });
		}
		return { saved: true };
	},
	delete: async ({ locals, params }) => {
		requireUser(locals);
		const db = await locals.db();
		const [r] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, params.id));
		if (!r) error(404, 'Niet gevonden');
		await saveTx(db, async (tx) => {
			await tx.delete(schema.reviews).where(eq(schema.reviews.id, params.id));
			await markChanged(tx, 'reviews', params.id, `Review ${r.author_name}`, 'verwijderd');
		});
		redirect(303, '/admin/reviews');
	}
};
