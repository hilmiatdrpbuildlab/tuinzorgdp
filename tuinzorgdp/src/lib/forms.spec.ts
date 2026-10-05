import { describe, expect, it } from 'vitest';
import { MESSAGES, checkPhotos, readForm, sniffImage, validate } from './forms';

const quote = {
	diensten: ['snoeien'],
	voornaam: 'An',
	achternaam: 'Peeters',
	telefoon: '0470 12 34 56',
	email: 'an@voorbeeld.be',
	adres: 'Dorpstraat 1',
	postcode: '2000',
	gemeente: 'Antwerpen',
	timing: '',
	oppervlakte: '',
	bericht: 'Graag de haag snoeien.',
	privacy: true
};

describe('quote form', () => {
	it('accepts a complete request', () => {
		expect(validate('offerte', quote).ok).toBe(true);
	});
	it('requires at least one service and the consent, with the Dutch messages', () => {
		const r = validate('offerte', { ...quote, diensten: [], privacy: false });
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.errors.diensten).toBe(MESSAGES.diensten);
			expect(r.errors.privacy).toBe(MESSAGES.privacy);
		}
	});
	it('checks the Belgian postcode', () => {
		for (const pc of ['0999', '123', '12345', 'abcd']) {
			const r = validate('offerte', { ...quote, postcode: pc });
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.errors.postcode).toBe(MESSAGES.postcode);
		}
		expect(validate('offerte', { ...quote, postcode: '9000' }).ok).toBe(true);
	});
	it('caps the message at 600 characters', () => {
		const r = validate('offerte', { ...quote, bericht: 'x'.repeat(601) });
		expect(r.ok).toBe(false);
	});
	it('reads multi-value services from FormData', () => {
		const fd = new FormData();
		fd.append('diensten', 'maaien-en-bosmaaien');
		fd.append('diensten', 'snoeien');
		fd.set('privacy', 'on');
		const v = readForm(fd, 'offerte');
		expect(v.diensten).toEqual(['maaien-en-bosmaaien', 'snoeien']);
		expect(v.privacy).toBe(true);
	});
});

describe('question form', () => {
	it('requires name, e-mail and the question; phone is optional', () => {
		expect(
			validate('vraag', { naam: 'Jan', email: 'jan@voorbeeld.be', bericht: 'Werkt u in Lier?' }).ok
		).toBe(true);
		const r = validate('vraag', { naam: '', email: 'jan@', bericht: '' });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['bericht', 'email', 'naam']);
	});
});

describe('photo limits', () => {
	const mb = 1024 * 1024;
	it('allows five photos of 10 MB, 25 MB in total', () => {
		expect(checkPhotos(Array(5).fill({ size: 5 * mb })).ok).toBe(true);
		expect(checkPhotos(Array(6).fill({ size: mb })).ok).toBe(false);
		expect(checkPhotos([{ size: 11 * mb }]).ok).toBe(false);
		expect(checkPhotos(Array(3).fill({ size: 9 * mb })).ok).toBe(false);
	});
	it('sniffs the type from the bytes', () => {
		expect(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
		expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
			'image/png'
		);
		expect(
			sniffImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg">'))
		).toBeNull();
	});
});
