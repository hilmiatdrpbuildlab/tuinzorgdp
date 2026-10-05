import { describe, expect, it } from 'vitest';
import {
	areaGuards,
	projectGuards,
	reviewGuards,
	seoGuards,
	slugify,
	slugRedirect,
	wordCount
} from './rules';
import { clampText, seoTitle } from './seo';
import { galleryRatio, snapRatio, variantWidths } from './media';

describe('publishing guards', () => {
	it('a project needs a cover, a gallery photo and alt text', () => {
		expect(
			projectGuards({ cover_media_id: null, galleryCount: 0, missingAlt: 0 }).map((g) => g.field)
		).toEqual(['cover', 'photos']);
		expect(
			projectGuards({ cover_media_id: 'x', galleryCount: 2, missingAlt: 1 })[0].message
		).toMatch(/alt-tekst/);
		expect(projectGuards({ cover_media_id: 'x', galleryCount: 1, missingAlt: 0 })).toEqual([]);
	});
	it('a review needs consent', () => {
		expect(reviewGuards({ consent_confirmed: false })).toHaveLength(1);
		expect(reviewGuards({ consent_confirmed: true })).toHaveLength(0);
	});
	it('a werkgebied page needs an intro of 80 words', () => {
		expect(areaGuards({ intro: 'kort' })[0].message).toMatch(/1 woorden/);
		expect(areaGuards({ intro: Array(80).fill('woord').join(' ') })).toEqual([]);
	});
});

describe('SEO length rules', () => {
	it('flags titles over 62 and descriptions over 158 characters', () => {
		expect(seoGuards({ seo_title: 'a'.repeat(62), meta_description: 'b'.repeat(158) })).toEqual([]);
		expect(
			seoGuards({ seo_title: 'a'.repeat(63), meta_description: 'b'.repeat(159) }).map(
				(g) => g.field
			)
		).toEqual(['seo_title', 'meta_description']);
	});
	it('default titles fit', () => {
		expect(seoTitle(null, 'Snoeien')).toBe('Snoeien | TuinZorg DP');
		expect(seoTitle(null, 'x'.repeat(70)).length).toBeLessThanOrEqual(62);
		expect(clampText('een twee drie vier vijf', 12)).toBe('een twee…');
	});
});

describe('slugs and redirects', () => {
	it('makes lowercase Dutch slugs', () => {
		expect(slugify('Maaien & bosmaaien')).toBe('maaien-en-bosmaaien');
		expect(slugify('Tuinonderhoud in Sint-Niklaas (België)')).toBe(
			'tuinonderhoud-in-sint-niklaas-belgie'
		);
	});
	it('a renamed slug writes a 301 from the old path', () => {
		expect(slugRedirect('/diensten', 'snoei', 'snoeien')).toEqual({
			from_path: '/diensten/snoei',
			to_path: '/diensten/snoeien',
			status: 301
		});
		expect(slugRedirect('/diensten', 'snoeien', 'snoeien')).toBeNull();
	});
	it('counts words', () => {
		expect(wordCount('## Titel\n\nEen *korte* tekst, met 6 woorden.')).toBe(7);
	});
});

describe('images', () => {
	it('never makes a variant wider than the original or 2400 px', () => {
		expect(variantWidths(900)).toEqual([480, 900]);
		expect(variantWidths(4000)).toEqual([480, 960, 1600, 2400]);
	});
	it('snaps ratios and staggers portrait photos', () => {
		expect(snapRatio(1600, 1200)).toBe('4x3');
		expect(snapRatio(1000, 1000)).toBe('1x1');
		const ratios = new Set([0, 1, 2, 3, 4].map((i) => galleryRatio(900, 1200, i)));
		expect(ratios.size).toBeGreaterThan(2);
	});
});
