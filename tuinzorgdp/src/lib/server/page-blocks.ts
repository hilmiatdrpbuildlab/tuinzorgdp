/** `pages.blocks` is validated per slug (docs/cms-plan/03-database.md). Only the home page has blocks. */
import { z } from 'zod';
import { PERK_ICON_NAMES } from '$lib/content/perk-icons';

const text = (max: number, message: string) =>
	z.string().trim().min(1, message).max(max, `Maximaal ${max} tekens.`);
const accent = z.string().trim().max(40, 'Maximaal 40 tekens.');

export const homeBlocks = z
	.object({
		hero: z.object({
			title: text(80, 'Vul de titel van de hero in.'),
			accentWord: accent,
			lead: text(240, 'Vul de inleiding in.'),
			usps: z.array(text(40, 'Vul elk voordeel in.')).length(3, 'Geef precies drie voordelen.')
		}),
		about: z.object({
			eyebrow: text(40, 'Vul het kopje in.'),
			title: text(90, 'Vul de titel in.'),
			accentWord: accent,
			lead: text(500, 'Vul de tekst in.'),
			perks: z
				.array(
					z.object({
						title: text(40, 'Vul elke titel in.'),
						text: text(120, 'Vul elke uitleg in.'),
						icon: z.enum(PERK_ICON_NAMES).optional()
					})
				)
				.min(1, 'Geef minstens één voordeel.')
				.max(6, 'Maximaal zes voordelen.'),
			mediaIds: z.array(z.string().uuid()).max(2)
		}),
		cta: z.object({
			title: text(100, 'Vul de titel in.'),
			accentWord: accent,
			lead: text(240, 'Vul de tekst in.')
		})
	})
	.superRefine((b, ctx) => {
		for (const [key, block] of Object.entries(b) as [
			string,
			{ title: string; accentWord: string }
		][]) {
			if (block.accentWord && !block.title.toLowerCase().includes(block.accentWord.toLowerCase())) {
				ctx.addIssue({
					code: 'custom',
					path: [key, 'accentWord'],
					message: 'Het accentwoord moet in de titel staan.'
				});
			}
		}
	});

export type HomeBlocksInput = z.infer<typeof homeBlocks>;

export const BLOCK_SCHEMAS: Record<string, z.ZodType | undefined> = { home: homeBlocks };
