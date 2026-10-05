import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { dbMessage, saveTx } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const db = await locals.db();
	const [faq] = await db.select().from(schema.faqs).where(eq(schema.faqs.id, params.id));
	if (!faq) error(404, 'Niet gevonden');
	const services = await db
		.select({ id: schema.services.id, title: schema.services.title })
		.from(schema.services)
		.orderBy(asc(schema.services.sort_order));
	return { faq, services };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const db = await locals.db();
		const [current] = await db.select().from(schema.faqs).where(eq(schema.faqs.id, params.id));
		if (!current) error(404, 'Niet gevonden');

		const values = {
			question: f.str('question'),
			answer: f.str('answer'),
			service_id: f.id('service_id'),
			show_on_home: f.bool('show_on_home'),
			is_published: f.bool('is_published')
		};

		const errors: Record<string, string> = {};
		if (!values.question) errors.question = 'Vul een vraag in.';
		if (!values.answer) errors.answer = 'Vul een antwoord in.';
		if (Object.keys(errors).length)
			return fail(400, { errors, guards: [], message: 'Controleer de velden.' });

		try {
			await saveTx(db, async (tx) => {
				await tx.update(schema.faqs).set(values).where(eq(schema.faqs.id, params.id));
				await markChanged(tx, 'faqs', params.id, `FAQ ${values.question}`);
			});
		} catch (e) {
			return fail(400, { errors: {}, guards: [], message: dbMessage(e) });
		}
		return { saved: true };
	},
	delete: async ({ locals, params }) => {
		requireUser(locals);
		const db = await locals.db();
		const [q] = await db.select().from(schema.faqs).where(eq(schema.faqs.id, params.id));
		if (!q) error(404, 'Niet gevonden');
		await saveTx(db, async (tx) => {
			await tx.delete(schema.faqs).where(eq(schema.faqs.id, params.id));
			await markChanged(tx, 'faqs', params.id, `FAQ ${q.question}`, 'verwijderd');
		});
		redirect(303, '/admin/faq');
	}
};
