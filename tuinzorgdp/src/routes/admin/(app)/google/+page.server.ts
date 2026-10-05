import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { markChanged, requireUser } from '$lib/server/cms';
import { googleCron } from '$lib/server/cron';
import * as schema from '$lib/server/db/schema';
import { env } from '$lib/server/env';
import { fields } from '$lib/server/form';
import { dbMessage } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const [s] = await db.select({ google: schema.settings.google }).from(schema.settings).limit(1);
	const g = s?.google ?? {};
	return {
		google: {
			rating: g.rating ?? null,
			ratingCount: g.ratingCount ?? null,
			checkedOn: g.checkedOn ?? null,
			source: g.source ?? null,
			placeId: g.placeId ?? null
		},
		automatic: !!env('GOOGLE_PLACES_KEY')
	};
};

export const actions: Actions = {
	/** Fetches the score now, the same way the nightly cron does (it publishes when a value changed). */
	refresh: async ({ locals }) => {
		requireUser(locals);
		const key = env('GOOGLE_PLACES_KEY');
		if (!key)
			return fail(400, {
				errors: {},
				message: 'Automatisch ophalen staat niet aan. Vul de score hieronder zelf in.'
			});
		const db = await locals.db();
		try {
			const r = await googleCron(db, key, env('DEPLOY_HOOK_URL'));
			if (r.reason)
				return fail(400, { errors: {}, message: `Vernieuwen lukte niet: ${r.reason}.` });
			const notice = !r.changed
				? 'De score bij Google is niet veranderd.'
				: r.published
					? 'De score is bijgewerkt. De website wordt nu opnieuw gepubliceerd.'
					: 'De score is bijgewerkt. Publiceer om hem op de website te tonen.';
			return { saved: true, notice };
		} catch (e) {
			console.error('[google] refresh failed', e);
			return fail(400, {
				errors: {},
				message:
					'Google gaf geen antwoord. Controleer de place id in Instellingen of probeer later opnieuw.'
			});
		}
	},
	/** Without an API key the client types the two numbers from the Google profile. */
	save: async ({ request, locals }) => {
		requireUser(locals);
		if (env('GOOGLE_PLACES_KEY'))
			return fail(400, {
				errors: {},
				message: 'De score wordt automatisch opgehaald. Gebruik Nu vernieuwen.'
			});
		const f = fields(await request.formData());
		const ratingRaw = f.str('rating').replace(',', '.');
		const countRaw = f.str('ratingCount').replace(/[\s.]/g, '');
		const errors: Record<string, string> = {};
		const rating = Number(ratingRaw);
		const ratingCount = Number(countRaw);
		if (ratingRaw && (!/^\d(\.\d)?$/.test(ratingRaw) || rating < 1 || rating > 5))
			errors.rating = 'Vul een score in tussen 1,0 en 5,0, met hoogstens één cijfer na de komma.';
		if (countRaw && !/^\d{1,6}$/.test(countRaw))
			errors.ratingCount = 'Vul een geheel getal in, bijvoorbeeld 23.';
		if (ratingRaw && !countRaw) errors.ratingCount = 'Vul ook het aantal reviews in.';
		if (countRaw && !ratingRaw) errors.rating = 'Vul ook de score in.';
		if (Object.keys(errors).length) return fail(400, { errors, message: 'Controleer de velden.' });

		const db = await locals.db();
		const [s] = await db.select({ google: schema.settings.google }).from(schema.settings).limit(1);
		if (!s) return fail(400, { errors: {}, message: 'Sla eerst de Instellingen op.' });
		const google: schema.GoogleSettings = {
			...s.google,
			source: 'manual',
			checkedOn: new Date().toISOString().slice(0, 10)
		};
		if (ratingRaw) {
			google.rating = rating;
			google.ratingCount = ratingCount;
		} else {
			delete google.rating;
			delete google.ratingCount;
		}
		try {
			await db.update(schema.settings).set({ google }).where(eq(schema.settings.id, true));
			await markChanged(
				db,
				'settings',
				'google',
				ratingRaw
					? `Google-score ${ratingRaw.replace('.', ',')} (${ratingCount})`
					: 'Google-score verwijderd'
			);
		} catch (e) {
			return fail(400, { errors: {}, message: dbMessage(e) });
		}
		return { saved: true };
	}
};
