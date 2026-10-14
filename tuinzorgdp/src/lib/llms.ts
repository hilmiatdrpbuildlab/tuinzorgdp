/**
 * /llms.txt (https://llmstxt.org): a Markdown summary of the business for AI assistants and
 * generative search engines. Built from the published content at every build, so it never needs
 * separate editing: services, realisaties, werkgebied, FAQ and contact details come from the CMS.
 */
import type { SiteContent } from '$lib/content/types';
import { hoursText } from '$lib/hours';

const line = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

/** HTML from the Markdown renderer as plain text: list items keep a dash, blocks a blank line. */
const htmlText = (html: string) =>
	html
		.replace(/<li[^>]*>/g, '- ')
		.replace(/<\/(p|li|h[1-6]|ul|ol)>/g, '\n')
		.replace(/<br\s*\/?>/g, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\n{3,}/g, '\n\n')
		.trim();

/** The title, the one-line summary and the contact facts both files start with. */
function header(content: SiteContent, siteUrl: string): string[] {
	const s = content.settings;
	const c = s.company;
	const areas = content.areas.map((a) => a.name);
	const place = [c.postcode, c.city].filter(Boolean).join(' ');
	const out: string[] = [];

	out.push(`# ${c.name}`, '');
	out.push(`> ${line(content.home.hero.lead)}`, '');
	out.push(
		`${c.name} is een tuinonderhoudsbedrijf in België${c.region ? ` (${c.region})` : ''} voor particulieren en bedrijven. ` +
			'Offertes zijn gratis en vrijblijvend. De website is in het Nederlands (Vlaams).',
		''
	);

	const facts = [
		c.phone ? `- Telefoon: ${c.phone}` : null,
		c.email ? `- E-mail: ${c.email}` : null,
		c.whatsapp ? `- WhatsApp: https://wa.me/${c.whatsapp.replace(/\D/g, '')}` : null,
		c.street && c.showStreet !== false && place
			? `- Adres: ${c.street}, ${place}, België`
			: place
				? `- Gemeente: ${place}, België`
				: null,
		areas.length
			? `- Werkgebied: ${areas.join(', ')} en omstreken`
			: c.region
				? `- Werkgebied: heel ${c.region}`
				: null,
		hoursText(s.hours) ? `- Openingsuren: ${hoursText(s.hours)}` : null,
		c.vat ? `- Ondernemingsnummer: ${c.vat}` : null,
		typeof s.google.rating === 'number' && s.google.ratingCount
			? `- Google-score: ${s.google.rating.toFixed(1)} op 5 (${s.google.ratingCount} reviews)`
			: null,
		`- Offerte aanvragen: ${siteUrl}/contact#offerte`
	].filter((x): x is string => !!x);
	out.push(...facts, '');
	return out;
}

export function llmsTxt(content: SiteContent, siteUrl: string): string {
	const out = header(content, siteUrl);

	out.push('## Diensten', '');
	for (const sv of content.services) {
		out.push(`- [${sv.title}](${siteUrl}/diensten/${sv.slug}): ${line(sv.summary)}`);
	}
	out.push('');

	if (content.projects.length) {
		out.push('## Realisaties', '');
		for (const p of content.projects) {
			const where = p.area ? ` in ${p.area.name}` : '';
			out.push(
				`- [${p.title}](${siteUrl}/realisaties/${p.slug}): ${p.service.title}${where}. ${line(p.summary)}`.trim()
			);
		}
		out.push('');
	}

	if (content.areas.length) {
		out.push('## Werkgebied', '');
		for (const a of content.areas)
			out.push(`- [Tuinonderhoud in ${a.name}](${siteUrl}/tuinonderhoud/${a.slug})`);
		out.push('');
	}

	if (content.faqs.length) {
		out.push('## Veelgestelde vragen', '');
		for (const f of content.faqs) out.push(`- ${line(f.question)} ${line(f.answer)}`);
		out.push('');
	}

	out.push("## Pagina's", '');
	out.push(`- [Home](${siteUrl}/): overzicht van de diensten, realisaties en werkwijze`);
	out.push(`- [Diensten](${siteUrl}/diensten): alle diensten`);
	if (content.projects.length)
		out.push(`- [Realisaties](${siteUrl}/realisaties): foto's van uitgevoerde opdrachten`);
	out.push(`- [Contact](${siteUrl}/contact): offerte aanvragen of een vraag stellen`);
	out.push('');

	out.push('## Optional', '');
	if (content.pages.privacy && !content.pages.privacy.noindex)
		out.push(`- [Privacybeleid](${siteUrl}/privacy)`);
	out.push(
		`- [Volledige tekst](${siteUrl}/llms-full.txt): alle diensten, realisaties en antwoorden voluit`
	);
	out.push(`- [Sitemap](${siteUrl}/sitemap.xml)`);
	out.push('');

	return out.join('\n');
}

/**
 * /llms-full.txt: the same facts plus the full text of every service, realisatie, werkgebied page
 * and FAQ answer, so an assistant can answer from one file without visiting each page.
 */
export function llmsFullTxt(content: SiteContent, siteUrl: string): string {
	const out = header(content, siteUrl);

	out.push('## Diensten', '');
	for (const sv of content.services) {
		out.push(`### ${sv.title}`, '', `Pagina: ${siteUrl}/diensten/${sv.slug}`, '');
		out.push(line(sv.summary), '');
		const body = htmlText(sv.bodyHtml);
		if (body) out.push(body, '');
		if (sv.bullets.length) out.push(...sv.bullets.map((b) => `- ${line(b)}`), '');
	}

	if (content.projects.length) {
		out.push('## Realisaties', '');
		for (const p of content.projects) {
			out.push(`### ${p.title}`, '', `Pagina: ${siteUrl}/realisaties/${p.slug}`);
			out.push(`Dienst: ${p.service.title}${p.area ? `, in ${p.area.name}` : ''}`, '');
			if (p.summary) out.push(line(p.summary), '');
			const body = htmlText(p.bodyHtml);
			if (body) out.push(body, '');
			const shown = p.photos.map((ph) => ph.media.alt).filter(Boolean);
			if (shown.length) out.push("Foto's:", ...shown.map((a) => `- ${line(a)}`), '');
		}
	}

	if (content.areas.length) {
		out.push('## Werkgebied', '');
		for (const a of content.areas) {
			out.push(
				`### Tuinonderhoud in ${a.name}`,
				'',
				`Pagina: ${siteUrl}/tuinonderhoud/${a.slug}`,
				''
			);
			if (a.introText) out.push(line(a.introText), '');
		}
	}

	if (content.faqs.length) {
		out.push('## Veelgestelde vragen', '');
		for (const f of content.faqs) out.push(`### ${line(f.question)}`, '', line(f.answer), '');
	}

	return out.join('\n');
}
