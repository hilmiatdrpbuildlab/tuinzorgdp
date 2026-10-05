# Spacing, layout and responsive behaviour

## Base grid
A 4px base with an 8px rhythm. Every margin, padding and gap is a spacing token.

## Spacing scale

| Token | Value | Typical use |
| --- | --- | --- |
| `space-3xs` | 2px | Hairline offsets |
| `space-2xs` | 4px | Icon to text in badges and stars |
| `space-xs` | 8px | Eyebrow to title, label to input, icon to text in buttons |
| `space-sm` | 12px | Compact gaps, gallery gutter on phones |
| `space-md` | 16px | Input padding, form field gaps, phone page margin |
| `space-lg` | 24px | Card padding, grid gutter, tablet page margin |
| `space-xl` | 32px | Large card padding |
| `space-2xl` | 48px | Section title to content |
| `space-3xl` | 64px | Blocks inside a section; section padding on phones |
| `space-4xl` | 96px | Section padding on tablets |
| `space-5xl` | 120px | Section padding on desktop |

## Containers and columns (mobile first)

| Range | Columns | Gutter | Page margin | Section padding | Header |
| --- | --- | --- | --- | --- | --- |
| Phone, under 768px (base CSS) | 4 | 16px | 16px | 64px | 68px, menu button |
| Tablet, 768–1023px | 8 | 24px | 24px | 96px | 68px, menu button + CTA |
| Desktop, 1024px and up | 12 | 24px | 40px | 120px | 84px, full nav |
| Max width | 12 | 24px | 40px | 120px | container 1240px |

- The base CSS is the phone layout; `min-width` queries add columns. Never write a desktop rule and undo it on phones.
- `.tz-container` caps content at `container-max` (1240px) plus margins. The hero is an inset card: 8px from the viewport edge on phones, 12px from tablet up.
- Breakpoints: `bp-sm` 640 (two-column cards and forms), `bp-md` 768 (tablet grid, 3-column gallery), `bp-lg` 1024 (full header, side-by-side splits), `bp-xl` 1280. Components may add their own steps at 900px and 1100px where the content needs it.

## How each grid collapses

| Component | Phone | 640px | 768px | 1024px | 1100px+ |
| --- | --- | --- | --- | --- | --- |
| Header | Logo + menu button, drawer | + CTA button | same | Full nav, CTA | + phone (1180px) |
| Hero | Copy, buttons wrap, USPs stacked | same | USPs in 3 columns | Copy + quote card side by side | same |
| About | Photos above copy, perks 1 column | Perks 2 columns | same | Photos 5 / copy 7 | same |
| Service grid | 1 column, featured first | 2 columns, featured full width | same | Featured side by side (900px) | 3 columns, featured spans 3 (image 2/3) |
| Project gallery | Masonry 2 columns, 12px gap | same | 3 columns | same | 4 columns, 24px gap |
| Filter tags | One scrolling row | same | wraps | wraps | wraps |
| Process steps | 1 column | 2 columns | same | 4 columns with dashed connectors | same |
| Reviews | Summary, then cards in a swipe row (86% wide) | same | 2 cards visible | Summary 340px + 2-column grid | 3-column grid (1240px) |
| Social feed | 2 columns | same | 3 columns | 6 columns | same |
| Contact | Copy + lines, then form card | Form rows 2 columns | same | 5 / 7 split, copy sticky | same |
| Service tiles | 2 columns | 3 columns | same | 4 columns | same |
| Footer | Brand, 2 link columns, then contact, areas, map full width | same | 3 columns | Brand 3 / columns 9, map beside areas | same |

## Shape and depth
- Radius: `radius-xs` (6px) for checkboxes and small chips; `radius-sm` (10px) for inputs and toasts; `radius-md` (16px) for cards, gallery photos and accordions; `radius-lg` (24px) for the quote card, map and feature photos; `radius-xl` (32px) for the hero card and CTA band; `radius-full` for buttons, chips, avatars and tags.
- Elevation goes border first: a 1px `line` outline for cards; `shadow-md` on hover and for the floating quote card; `shadow-lg` for the lightbox and toasts. Shadows are tinted with forest-900, never pure black on Light.
