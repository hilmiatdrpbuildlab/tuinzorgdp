import { Marked, type Tokens } from 'marked';

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const marked = new Marked({
	gfm: true,
	breaks: false,
	renderer: {
		// No raw HTML from the CMS: it is shown as text.
		html({ text }: Tokens.HTML | Tokens.Tag) {
			return escapeHtml(text);
		},
		link({ href, title, tokens }: Tokens.Link) {
			const text = this.parser.parseInline(tokens);
			const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : '#';
			const external = /^https?:/i.test(safe);
			const t = title ? ` title="${escapeHtml(title)}"` : '';
			const rel = external ? ' rel="noopener noreferrer"' : '';
			return `<a href="${escapeHtml(safe)}"${t}${rel}>${text}</a>`;
		},
		image({ text }: Tokens.Image) {
			// Images belong in media fields, not in body text.
			return escapeHtml(text);
		}
	}
});

/** Markdown from the CMS to sanitised HTML, rendered at build time. */
export function renderMarkdown(md: string | null | undefined): string {
	if (!md) return '';
	return marked.parse(md, { async: false }) as string;
}

export function plainText(md: string | null | undefined): string {
	if (!md) return '';
	return md
		.replace(/[#*_>`[\]()-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
