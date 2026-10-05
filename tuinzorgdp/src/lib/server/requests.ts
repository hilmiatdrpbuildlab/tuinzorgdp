/**
 * The quote and question forms (docs/cms-plan/06-public-site.md, "The two forms"):
 * 1 spam checks, 2 validation, 3 garden photos to the bucket, 4 notification mail first,
 * 5 visitor confirmation, 6 the requests row, 7 the answer. A failing database never loses a
 * request, because the owner already has the mail; a failing photo upload never stops one.
 */
import { eq, inArray } from 'drizzle-orm';
import {
	checkPhotos,
	readForm,
	sniffImage,
	validate,
	type FieldErrors,
	type QuestionInput,
	type QuoteInput
} from '$lib/forms';
import type { Db } from './db/client';
import * as schema from './db/schema';
import { confirmationMail, notificationMail, type Mail, type RequestSummary } from './mail';
import type { Storage } from './storage-core';

export type SubmitDeps = {
	db: () => Promise<Db>;
	storage: () => Promise<Storage>;
	sendMail: (mail: Mail) => Promise<void>;
	verifyTurnstile: (token: string | null) => Promise<boolean>;
	rateLimited: () => Promise<boolean>;
	adminUrl: string;
	notifyFallback: string;
	/** Without JavaScript there is no Turnstile token; the honeypot and the rate limit still apply. */
	allowNoJs: boolean;
	log?: (msg: string, err?: unknown) => void;
	newId?: () => string;
};

export type SubmitResult =
	| { status: 'ok'; id: string; mailed: boolean; stored: boolean }
	| { status: 'spam' }
	| { status: 'invalid'; errors: FieldErrors }
	| { status: 'limited' }
	| { status: 'failed' };

const EXT: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

export async function processSubmission(form: FormData, deps: SubmitDeps): Promise<SubmitResult> {
	const log = deps.log ?? ((m: string, e?: unknown) => console.error(m, e ?? ''));
	const kind = form.get('kind') === 'vraag' ? 'vraag' : 'offerte';

	// 1. Spam: honeypot, Turnstile, rate limit.
	if (String(form.get('website') ?? '').trim() !== '') return { status: 'spam' };
	const js = form.get('js') === '1';
	const token = form.get('cf-turnstile-response');
	if (js || token || !deps.allowNoJs) {
		if (!(await deps.verifyTurnstile(typeof token === 'string' ? token : null)))
			return { status: 'spam' };
	}
	if (await deps.rateLimited()) return { status: 'limited' };

	// 2. Validation, with the same Dutch messages as the browser.
	const checked = validate(kind, readForm(form, kind));
	if (!checked.ok) return { status: 'invalid', errors: checked.errors };

	const photos =
		kind === 'offerte'
			? form
					.getAll('fotos')
					.filter(
						(f): f is File => typeof f === 'object' && f !== null && 'size' in f && f.size > 0
					)
			: [];
	const photoCheck = checkPhotos(photos);
	if (!photoCheck.ok) return { status: 'invalid', errors: { fotos: photoCheck.message } };

	const id = deps.newId?.() ?? crypto.randomUUID();

	// 3. Photos to requests/<id>/<n>.<ext>. A storage failure does not stop the request.
	const stored: { key: string; mime: string; bytes: number }[] = [];
	let photosFailed = 0;
	for (const [i, file] of photos.entries()) {
		try {
			const bytes = new Uint8Array(await file.arrayBuffer());
			const mime = sniffImage(bytes);
			if (!mime) {
				photosFailed++;
				continue;
			}
			const key = `requests/${id}/${i + 1}.${EXT[mime]}`;
			await (await deps.storage()).put(key, bytes, mime);
			stored.push({ key, mime, bytes: bytes.byteLength });
		} catch (e) {
			photosFailed++;
			log('[submit] photo upload failed', e);
		}
	}

	// Labels and the notification address come from Neon when it answers.
	let db: Db | null;
	let notifyTo = deps.notifyFallback;
	let serviceLabels: string[] = [];
	const slugs = kind === 'offerte' ? (checked.data as QuoteInput).diensten : [];
	try {
		db = await deps.db();
		const [settings] = await db
			.select({ notify: schema.settings.notify_email })
			.from(schema.settings)
			.limit(1);
		if (settings?.notify) notifyTo = settings.notify;
		if (slugs.length) {
			const rows = await db
				.select({ slug: schema.services.slug, title: schema.services.title })
				.from(schema.services)
				.where(inArray(schema.services.slug, slugs));
			serviceLabels = slugs.map(
				(s) => rows.find((r) => r.slug === s)?.title ?? (s === 'anders' ? 'Anders' : s)
			);
		}
	} catch (e) {
		log('[submit] database unavailable before mail', e);
		db = null;
	}
	if (!serviceLabels.length) serviceLabels = slugs.map((s) => (s === 'anders' ? 'Anders' : s));

	const summary: RequestSummary =
		kind === 'offerte'
			? (() => {
					const q = checked.data as QuoteInput;
					return {
						id,
						kind,
						firstName: q.voornaam,
						lastName: q.achternaam,
						email: q.email,
						phone: q.telefoon,
						street: q.adres,
						postcode: q.postcode,
						municipality: q.gemeente,
						services: serviceLabels,
						timing: q.timing || null,
						gardenSize: q.oppervlakte || null,
						message: q.bericht,
						photosSaved: stored.length,
						photosFailed
					};
				})()
			: (() => {
					const v = checked.data as QuestionInput;
					return {
						id,
						kind,
						firstName: v.naam,
						email: v.email,
						phone: v.telefoon || null,
						services: [],
						message: v.bericht,
						photosSaved: 0,
						photosFailed: 0
					};
				})();

	// 4. The notification goes out before anything is written.
	let mailed = false;
	try {
		await deps.sendMail(notificationMail(summary, notifyTo, deps.adminUrl));
		mailed = true;
	} catch (e) {
		log('[submit] notification mail failed', e);
	}

	// 5. A short, fixed confirmation to the visitor.
	try {
		await deps.sendMail(
			confirmationMail({
				email: summary.email,
				firstName: summary.firstName.split(' ')[0],
				kind,
				services: serviceLabels
			})
		);
	} catch (e) {
		log('[submit] confirmation mail failed', e);
	}

	// 6. The row and its files. No IP address is stored.
	let storedRow = false;
	try {
		db ??= await deps.db();
		await db.insert(schema.requests).values({
			id,
			kind,
			first_name: summary.firstName,
			last_name: summary.lastName ?? null,
			email: summary.email,
			phone: summary.phone ?? null,
			street: summary.street ?? null,
			postcode: summary.postcode ?? null,
			municipality: summary.municipality ?? null,
			services: slugs,
			timing: summary.timing ?? null,
			garden_size: summary.gardenSize ?? null,
			message: summary.message,
			consent_at: kind === 'offerte' ? new Date() : null,
			notified_at: mailed ? new Date() : null
		});
		if (stored.length) {
			await db
				.insert(schema.requestFiles)
				.values(
					stored.map((f) => ({ request_id: id, object_key: f.key, mime: f.mime, bytes: f.bytes }))
				);
		}
		storedRow = true;
	} catch (e) {
		log('[submit] storing the request failed; the owner has the mail', e);
	}

	// 7. Only when both the mail and the row failed is the request lost.
	if (!mailed && !storedRow) return { status: 'failed' };
	return { status: 'ok', id, mailed, stored: storedRow };
}

/** Deletes requests (and their photos) older than 12 months. Returns how many were removed. */
export async function purgeOldRequests(db: Db, store: Storage, now = new Date()): Promise<number> {
	const cutoff = new Date(now);
	cutoff.setMonth(cutoff.getMonth() - 12);
	const { lt } = await import('drizzle-orm');
	const old = await db
		.select({ id: schema.requests.id })
		.from(schema.requests)
		.where(lt(schema.requests.created_at, cutoff));
	for (const r of old) await deleteRequest(db, store, r.id);
	return old.length;
}

export async function deleteRequest(db: Db, store: Storage, id: string): Promise<void> {
	const files = await db
		.select()
		.from(schema.requestFiles)
		.where(eq(schema.requestFiles.request_id, id));
	for (const f of files) await store.delete(f.object_key);
	await db.delete(schema.requests).where(eq(schema.requests.id, id));
}
