# Color system

Six brand colours from the current site and the logo, extended into scales: Forest Green `forest-700` #2D5A27, Leaf Green `leaf-500` #4CAF50, Earth Brown `bark-500` #8D6E63, Dark Charcoal `charcoal-800` #333333, Light Nature Gray `sage-50` #F4F7F4 and white. Components use only the semantic tokens below; the palette exists to define them.

## Primary, secondary and accent

| Role | Token (Light) | Hex | Use |
| --- | --- | --- | --- |
| Primary | `forest-700` / `forest-800` | #2D5A27 / #224620 | Brand, logo, headings (`heading`), links, button hover |
| Action | `leaf-700` (`accent`) | #2E7432 | The primary button with white text (5.7:1), checked controls |
| Accent (marks) | `leaf-600` (`highlight`) | #3D9141 | Leaf eyebrow mark, active nav dot, checklist ticks, stars on Light |
| Brand leaf | `leaf-500` | #4CAF50 | Illustrations and marks in Forest only; never text on Light (2.6:1) |
| Fresh accent | `lime-300` | #A6E07A | The accent word in the Forest hero and on photos (9.0:1 on forest-900) |
| Secondary | `bark-500` / `bark-700` | #8D6E63 / #5C443C | Earth: Sand borders and marks, brown labels and captions |
| Background | `sage-50` / `sand-100` | #F4F7F4 / #F3EEE6 | Light page ground / Sand section ground |
| Surface | `white` | #FFFFFF | Cards, inputs, header, the quote card |
| Text | `charcoal-800` | #333333 | Body text (11.7:1 on sage-50) |

- `accent` is the primary action colour: `leaf-700` in Light and Sand (white text 5.7:1), `leaf-400` in Forest (forest-950 text 7.9:1). Hover is `accent-hover` (forest-700, a deeper green), pressed `accent-press`.
- `accent-word` sets one highlighted word per title, the two-tone headline of the reference layout: `leaf-700` on Light (5.3:1), `lime-300` in Forest.
- `link` is forest text: `forest-700` on Light (7.5:1), `leaf-300` in Forest. Links in running text are always underlined.
- `highlight` is for non-text marks: 3:1 or more on every ground.

## Neutrals, surfaces and backgrounds

| Token | Light | Forest | Sand | Use |
| --- | --- | --- | --- | --- |
| `bg` | sage-50 | forest-900 | sand-100 | Page and section ground |
| `surface` | white | forest-850 | white | Cards, panels, inputs, header |
| `surface-sunken` | sage-100 | forest-950 | sand-200 | Image placeholders, icon wells, tab rails |
| `surface-inverse` | forest-950 | sage-50 | forest-950 | Toasts, tooltips |
| `tint` | forest-50 | 12% leaf | bark-100 | Icon chips, selected tiles, hover wash |
| `line` | sage-200 | 14% sage | 16% bark | Decorative hairlines |
| `line-strong` | sage-500 | moss-500 | bark-500 | Control borders (3:1 or more) |

## Text and hierarchy

| Token | Light | Forest | Sand | Lowest ratio on bg / surface / sunken |
| --- | --- | --- | --- | --- |
| `heading` | forest-800 | sage-50 | forest-800 | 9.3 · 10.3 · 8.2 |
| `ink` | charcoal-800 | sage-50 | charcoal-800 | 10.9 · 10.3 · 9.7 |
| `ink-soft` | sage-700 | mist-200 | bark-700 | 6.7 · 7.3 · 6.2 |
| `ink-faint` | sage-600 | mist-300 | bark-700 | 5.1 · 5.5 · 4.6 |
| `ink-inverse` | sage-50 | forest-950 | sage-50 | 15.6 on surface-inverse |

Hierarchy: titles in `heading`; body in `ink`; leads, descriptions and meta in `ink-soft`; placeholders, captions and timestamps in `ink-faint`. Do not go lighter.

## Feedback and status

| Status | Light text / tint | Forest text / tint | Used for |
| --- | --- | --- | --- |
| Success | forest-700 / forest-50 | leaf-300 / #21452A | Aanvraag verstuurd, saved, published |
| Warning | amber-700 / amber-50 | amber-300 / #3B3A1F | Missing photo or alt text, unsaved changes |
| Error | red-700 / red-50 | red-300 / #43302A | Form errors, failed sends |
| Info | blue-700 / blue-50 | blue-300 / #1E3A3D | Tips, notes |

- Success is the brand green, so a success message always carries `circle-check` and a sentence; an error always carries `circle-x`.
- Review stars are `amber-700` on Light and Sand, `amber-300` on Forest and photos.

## Light, Forest and Sand
- Website: Light is the page; Forest and Sand are section themes set with `data-theme` on a section. The site does not follow the visitor's system setting; the Forest hero and footer already give it depth.
- CMS: Light, with Forest as its dark mode (follow `prefers-color-scheme` on first load, then the user's toggle).
- Forest is designed, not inverted: grounds `forest-900` / `forest-850`, the button moves to `leaf-400` with dark text, the accent word to `lime-300`, shadows deepen.

## Accessibility and contrast rules
- Body text and anything under 24px (or 19px bold): 4.5:1 minimum (AA). The system's body text reaches 7:1+ (AAA) on every ground.
- Large display type (24px+): 3:1 minimum.
- Control borders, focus rings, icons that carry meaning: 3:1 minimum (WCAG 1.4.11).
- Never put white text on `leaf-500` or `leaf-600`, or body text in `bark-500` on Sand.
- The hero overlay (`overlay`) darkens the left half of the photo: white text over a bright lawn pixel (#9CCC6A) is 6.9:1 at the 50% stop and 13.2:1 at the left edge. Keep the headline and buttons in the left half; the right side shows the garden.
- Run `python src/check_contrast.py` after any colour change; it fails on a pair below its floor in any theme.
