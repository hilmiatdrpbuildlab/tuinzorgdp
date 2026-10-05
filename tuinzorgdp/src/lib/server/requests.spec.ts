import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Db } from './db/client';
import * as schema from './db/schema';
import type { Mail } from './mail';
import { processSubmission, purgeOldRequests, type SubmitDeps } from './requests';
import { JPEG, memoryDb, memoryStorage } from './test-utils';

let db: Db;
let store: ReturnType<typeof memoryStorage>;
let mails: Mail[];
let order: string[];

function quoteForm(photos = 0) {
	const fd = new FormData();
	fd.set('kind', 'offerte');
	fd.set('js', '1');
	fd.set('cf-turnstile-response', 'token');
	fd.append('diensten', 'snoeien');
	for (const [k, v] of Object.entries({
		voornaam: 'An',
		achternaam: 'Peeters',
		telefoon: '0470123456',
		email: 'an@voorbeeld.be',
		adres: 'Dorpstraat 1',
		postcode: '2500',
		gemeente: 'Lier',
		bericht: 'Haag snoeien'
	}))
		fd.set(k, v);
	fd.set('privacy', 'on');
	for (let i = 0; i < photos; i++)
		fd.append('fotos', new File([JPEG], `t${i}.jpg`, { type: 'image/jpeg' }));
	return fd;
}

function deps(over: Partial<SubmitDeps> = {}): SubmitDeps {
	return {
		db: async () => db,
		storage: async () => store,
		sendMail: async (m) => {
			order.push(`mail:${m.subject.split(' ')[0]}`);
			mails.push(m);
		},
		verifyTurnstile: async () => true,
		rateLimited: async () => false,
		adminUrl: 'https://tuinzorgdp.test',
		notifyFallback: 'info@tuinzorgdp.be',
		allowNoJs: true,
		log: () => {},
		...over
	};
}

beforeEach(async () => {
	db = await memoryDb();
	store = memoryStorage();
	mails = [];
	order = [];
});

describe('processSubmission', () => {
	it('stores the photos, mails the owner and the visitor, then writes the row', async () => {
		const r = await processSubmission(quoteForm(3), deps());
		expect(r.status).toBe('ok');
		expect(mails[0].subject).toBe('Offerte · Lier · An Peeters');
		expect(mails[0].replyTo?.email).toBe('an@voorbeeld.be');
		expect(mails[1].subject).toBe('We hebben uw aanvraag goed ontvangen');
		expect(mails[1].text).not.toContain('Haag snoeien');
		const rows = await db.select().from(schema.requests);
		expect(rows).toHaveLength(1);
		expect(rows[0].notified_at).not.toBeNull();
		expect(await db.select().from(schema.requestFiles)).toHaveLength(3);
		expect([...store.files.keys()].every((k) => k.startsWith(`requests/${rows[0].id}/`))).toBe(
			true
		);
	});

	it('sends the notification even when the database is down', async () => {
		const r = await processSubmission(
			quoteForm(),
			deps({
				db: async () => {
					throw new Error('neon asleep');
				}
			})
		);
		expect(r).toMatchObject({ status: 'ok', mailed: true, stored: false });
		expect(mails).toHaveLength(2);
	});

	it('goes through when a photo cannot be stored, and says so in the mail', async () => {
		store.failPut = true;
		const r = await processSubmission(quoteForm(2), deps());
		expect(r.status).toBe('ok');
		expect(mails[0].text).toMatch(/2 foto's konden niet opgeslagen worden/);
	});

	it('fails only when both the mail and the row fail', async () => {
		const r = await processSubmission(
			quoteForm(),
			deps({
				sendMail: async () => {
					throw new Error('brevo');
				},
				db: async () => {
					throw new Error('neon');
				}
			})
		);
		expect(r.status).toBe('failed');
	});

	it('drops spam silently and refuses over the rate limit', async () => {
		const spam = quoteForm();
		spam.set('website', 'http://spam.example');
		expect((await processSubmission(spam, deps())).status).toBe('spam');
		expect(
			(await processSubmission(quoteForm(), deps({ verifyTurnstile: async () => false }))).status
		).toBe('spam');
		expect(
			(await processSubmission(quoteForm(), deps({ rateLimited: async () => true }))).status
		).toBe('limited');
		expect(mails).toHaveLength(0);
	});

	it('refuses more than five photos with a Dutch message', async () => {
		const r = await processSubmission(quoteForm(6), deps());
		expect(r).toMatchObject({
			status: 'invalid',
			errors: { fotos: expect.stringMatching(/maximaal 5/) }
		});
	});

	it('returns field errors for an invalid form', async () => {
		const fd = quoteForm();
		fd.set('postcode', '12');
		const r = await processSubmission(fd, deps());
		expect(r).toMatchObject({ status: 'invalid', errors: { postcode: expect.any(String) } });
	});
});

describe('retention', () => {
	it('deletes requests older than 12 months with their photos', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-08-01T10:00:00Z'));
		await processSubmission(quoteForm(1), deps());
		vi.setSystemTime(new Date('2026-10-01T10:00:00Z'));
		await processSubmission(quoteForm(1), deps());
		vi.useRealTimers();
		expect(store.files.size).toBe(2);
		const removed = await purgeOldRequests(db, store, new Date('2026-10-05T10:00:00Z'));
		expect(removed).toBe(1);
		expect(await db.select().from(schema.requests)).toHaveLength(1);
		expect(store.files.size).toBe(1);
	});
});
