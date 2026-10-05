import { describe, expect, it } from 'vitest';
import { llmsTxt } from './llms';
import { buildContent, seedRaw } from './server/content';

describe('llms.txt', () => {
	const raw = seedRaw();
	raw.projects[0].is_published = false;
	const txt = llmsTxt(buildContent(raw), 'https://tuinzorgdp.be');

	it('follows the llmstxt.org shape: title, summary, link sections', () => {
		expect(txt.startsWith('# TuinZorg DP\n\n> ')).toBe(true);
		expect(txt).toContain('## Diensten');
		expect(txt).toContain('- [Snoeien](https://tuinzorgdp.be/diensten/snoeien): ');
		expect(txt).toContain('- Telefoon: +32 469 41 37 30');
	});

	it('lists only published content and leaves out unknown facts', () => {
		expect(txt).not.toContain(raw.projects[0].slug);
		expect(txt).not.toContain('Openingsuren');
		expect(txt).not.toContain('Werkgebied:');
		expect(txt).not.toContain('In welke gemeenten');
	});
});
