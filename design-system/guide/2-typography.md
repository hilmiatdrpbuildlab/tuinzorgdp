# Typography

## Pairing
- **Bricolage Grotesque** (Mathieu Triay, SIL OFL, free on Google Fonts) for display and headings, self-hosted as one variable file with weight (200–800), width (75–100) and optical size (12–96) axes. A grotesque with ink traps and slightly quirky curves: sturdy and hands-on at weight 800, friendly rather than corporate. Set at 92% width (`font-variation-settings: "wdth" 92`) so long Dutch words such as *tuinafboording* and *gazononderhoud* fit.
- **Figtree** (Erik Kennedy, SIL OFL) for text, UI, buttons, labels and forms, as one variable file (300–900). Geometric, open and very legible at 15–17px on phones; its round shapes echo the pill buttons.
- Fallbacks: `"Segoe UI", system-ui, sans-serif`. Both families are in `fonts/` (latin subset); load them with `font-display: swap` and preload Bricolage for the hero.
- The logo words are converted to paths; never type the lockup as live text.

## Scale
Desktop sizes; the display styles step down at 1024px and 720px.

| Style | Font | Size / line height | Weight | Tracking | Tablet | Phone | Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `t-display` | Bricolage | 88 / 0.98 | 800 | −0.03em | 64 | 44 | Hero headline, once per page |
| `t-h1` | Bricolage | 60 / 1.02 | 750 | −0.025em | 48 | 38 | Section titles |
| `t-h2` | Bricolage | 44 / 1.06 | 700 | −0.02em | 44 | 30 | Sub-sections, CTA band, FAQ |
| `t-h3` | Bricolage | 30 / 1.15 | 700 | −0.015em | 30 | 24 | Form success, social title |
| `t-h4` | Bricolage | 22 / 1.25 | 650 | −0.01em | 22 | 22 | Service, step and project titles |
| `t-h5` | Figtree | 18 / 1.35 | 700 | 0 | 18 | 18 | FAQ questions, reviewer names |
| `t-h6` | Figtree | 16 / 1.4 | 700 | 0 | 16 | 16 | Footer columns, form groups |
| `t-lead` | Figtree | 20 / 1.55 | 400 | 0 | 20 | 18 | Intro paragraphs in `ink-soft` |
| `t-body` | Figtree | 17 / 1.65 | 400 | 0 | 17 | 17 | Running text |
| `t-body-strong` | Figtree | 17 / 1.65 | 650 | 0 | 17 | 17 | Emphasis, phone numbers |
| `t-small` | Figtree | 15 / 1.55 | 400 | 0 | 15 | 15 | Card text, hints, footer |
| `t-caption` | Figtree | 13 / 1.45 | 500 | 0 | 13 | 13 | Captions, legal lines |
| `t-button` | Figtree | 16 / 1 | 650 | 0.005em | 16 | 16 | Buttons (15 small, 17 large), nav |
| `t-label` | Figtree | 13 / 1.3 | 700 | 0.08em | 13 | 13 | Eyebrows, badges (uppercase) |
| `t-stat` | Bricolage | 48 / 1 | 800 | −0.02em | 48 | 40 | Review score, CMS counts |

## Rules
- Weights in use: 400, 500, 650, 700, 750, 800. No italics; emphasis is weight.
- Titles get `text-wrap: balance`, leads `text-wrap: pretty`. Running text stays within `measure` (66ch).
- Body text is 17px, not 16px: the audience includes older home owners reading on phones outdoors.
- Sentence case everywhere in the source. Only `t-label` (eyebrows, badges) is uppercased by CSS.
- One `.tz-accent-word` per title at most, and only in 22px+ titles.
- Numbers that line up (phone numbers, scores, counts) use tabular numerals.
