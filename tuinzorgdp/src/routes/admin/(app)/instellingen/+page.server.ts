import { fail } from '@sveltejs/kit';
import { markChanged, requireUser } from '$lib/server/cms';
import * as schema from '$lib/server/db/schema';
import { fields } from '$lib/server/form';
import { dbMessage } from '$lib/server/save';
import type { Actions, PageServerLoad } from './$types';

const DAYS = [
	{ value: 'Monday', label: 'Maandag' },
	{ value: 'Tuesday', label: 'Dinsdag' },
	{ value: 'Wednesday', label: 'Woensdag' },
	{ value: 'Thursday', label: 'Donderdag' },
	{ value: 'Friday', label: 'Vrijdag' },
	{ value: 'Saturday', label: 'Zaterdag' },
	{ value: 'Sunday', label: 'Zondag' }
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s./-]{8,20}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const HTTPS = /^https:\/\/\S+$/i;
const MAPS_EMBED = 'https://www.google.com/maps/embed';

/** "be0123456789", "BE 0123.456.789" → "BE 0123.456.789"; null when it is not a Belgian VAT number. */
function belgianVat(input: string): string | null {
	const t = input.replace(/[\s.-]/g, '').toUpperCase();
	const m = /^(?:BE)?([01]\d{9})$/.exec(t);
	if (!m) return null;
	const d = m[1];
	return `BE ${d.slice(0, 4)}.${d.slice(4, 7)}.${d.slice(7)}`;
}

export const load: PageServerLoad = async ({ locals }) => {
	requireUser(locals);
	const db = await locals.db();
	const [s] = await db.select().from(schema.settings).limit(1);
	return {
		settings: {
			company: s?.company ?? { name: 'TuinZorg DP' },
			hours: s?.hours ?? {},
			geo: s?.geo ?? {},
			socials: s?.socials ?? {},
			google: {
				placeId: s?.google.placeId,
				profileUrl: s?.google.profileUrl,
				writeReviewUrl: s?.google.writeReviewUrl
			},
			maps_embed_url: s?.maps_embed_url ?? null,
			notify_email: s?.notify_email ?? 'info@tuinzorgdp.be'
		},
		days: DAYS
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireUser(locals);
		const f = fields(await request.formData());
		const errors: Record<string, string> = {};
		const optional = (k: string) => f.str(k) || undefined;

		// Company
		const vatRaw = f.str('vat');
		const vat = vatRaw ? belgianVat(vatRaw) : undefined;
		const company: schema.Company = {
			name: f.str('name'),
			street: optional('street'),
			postcode: optional('postcode'),
			city: optional('city'),
			region: optional('region'),
			vat: vat ?? undefined,
			email: optional('email'),
			phone: optional('phone'),
			whatsapp: optional('whatsapp'),
			showStreet: f.bool('showStreet')
		};
		if (!company.name) errors.name = 'Vul de bedrijfsnaam in.';
		if (company.postcode && !/^[1-9]\d{3}$/.test(company.postcode))
			errors.postcode = 'Een Belgische postcode heeft 4 cijfers.';
		if (vatRaw && !vat)
			errors.vat = 'Vul een Belgisch btw-nummer in, bijvoorbeeld BE 0123.456.789.';
		if (company.email && !EMAIL.test(company.email))
			errors.email = 'Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.be.';
		if (company.phone && !PHONE.test(company.phone))
			errors.phone = 'Vul een geldig telefoonnummer in, bijvoorbeeld +32 469 41 37 30.';
		if (company.whatsapp && !PHONE.test(company.whatsapp))
			errors.whatsapp = 'Vul een geldig nummer in, bijvoorbeeld +32 469 41 37 30.';

		// Opening hours: free text, or days with one time range
		let hours: schema.Hours = {};
		if (f.str('hours_mode') === 'label') {
			const label = f.str('hours_label');
			if (label.length > 120) errors.hours_label = 'Maximaal 120 tekens.';
			hours = label ? { label } : {};
		} else {
			const days = f.list('days').filter((d) => DAYS.some((x) => x.value === d));
			const opens = f.str('opens');
			const closes = f.str('closes');
			if ((opens || closes || days.length) && !TIME.test(opens))
				errors.opens = 'Vul een openingsuur in, bijvoorbeeld 08:00.';
			if ((opens || closes || days.length) && !TIME.test(closes))
				errors.closes = 'Vul een sluitingsuur in, bijvoorbeeld 18:00.';
			if (!errors.opens && !errors.closes && opens && closes && opens >= closes)
				errors.closes = 'Het sluitingsuur ligt na het openingsuur.';
			if ((opens || closes) && !days.length) errors.days = 'Kies minstens één dag.';
			hours = opens && closes ? { days, opens, closes } : {};
		}

		// Social media and Google
		const socials: schema.Socials = {
			instagram: optional('instagram'),
			facebook: optional('facebook')
		};
		for (const k of ['instagram', 'facebook'] as const) {
			if (socials[k] && !HTTPS.test(socials[k]))
				errors[k] = 'Plak het volledige adres, beginnend met https://.';
		}
		const google = {
			profileUrl: optional('profileUrl'),
			writeReviewUrl: optional('writeReviewUrl'),
			placeId: optional('placeId')
		};
		for (const k of ['profileUrl', 'writeReviewUrl'] as const) {
			if (google[k] && !HTTPS.test(google[k]))
				errors[k] = 'Plak het volledige adres, beginnend met https://.';
		}
		if (google.placeId && !/^[\w-]{10,}$/.test(google.placeId))
			errors.placeId = 'Een place id bestaat uit letters, cijfers, - en _, bijvoorbeeld ChIJ…';

		// Map
		const geo: schema.Geo = {};
		const lat = f.num('lat');
		const lng = f.num('lng');
		if (f.str('lat') && (lat === undefined || lat < -90 || lat > 90))
			errors.lat = 'Vul een breedtegraad in tussen -90 en 90, bijvoorbeeld 51,13.';
		else if (lat !== undefined) geo.lat = lat;
		if (f.str('lng') && (lng === undefined || lng < -180 || lng > 180))
			errors.lng = 'Vul een lengtegraad in tussen -180 en 180, bijvoorbeeld 4,57.';
		else if (lng !== undefined) geo.lng = lng;
		if ((geo.lat === undefined) !== (geo.lng === undefined) && !errors.lat && !errors.lng)
			errors[geo.lat === undefined ? 'lat' : 'lng'] = 'Vul beide coördinaten in, of geen.';
		const maps_embed_url = f.opt('maps_embed_url');
		if (maps_embed_url && !maps_embed_url.startsWith(MAPS_EMBED))
			errors.maps_embed_url = `Plak het adres uit Google Maps, Kaart insluiten. Het begint met ${MAPS_EMBED}.`;

		const notify_email = f.str('notify_email');
		if (!EMAIL.test(notify_email))
			errors.notify_email = 'Vul een geldig e-mailadres in, bijvoorbeeld info@tuinzorgdp.be.';

		if (Object.keys(errors).length) return fail(400, { errors, message: 'Controleer de velden.' });

		const db = await locals.db();
		try {
			await db.transaction(async (tx) => {
				// Rating, count and the check date belong to the Google screen and the nightly cron.
				const [current] = await tx
					.select({ google: schema.settings.google })
					.from(schema.settings)
					.limit(1);
				const values = {
					company,
					hours,
					geo,
					socials,
					google: { ...(current?.google ?? {}), ...google },
					maps_embed_url,
					notify_email
				};
				await tx
					.insert(schema.settings)
					.values({ id: true, ...values })
					.onConflictDoUpdate({ target: schema.settings.id, set: values });
			});
			await markChanged(db, 'settings', 'settings', 'Instellingen');
		} catch (e) {
			return fail(400, { errors: {}, message: dbMessage(e) });
		}
		return { saved: true };
	}
};
