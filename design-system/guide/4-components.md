# Components and interaction

Twenty components for the website, each with its own card, live preview, rules and Svelte props. This section is the summary spec of the core set. Class prefix `tz-`; every colour is a semantic token, so each component works in Light, Forest and Sand.

## Buttons

| Variant | Fill / text | Hover | Active (pressed) | Focus | Disabled |
| --- | --- | --- | --- | --- | --- |
| Primary `.tz-btn` | `accent` / `on-accent` (leaf-700 / white) | `accent-hover` (forest-700), arrow chip slides 3px | `accent-press` (forest-800), 1px drop, 99% scale | 2px `focus` ring, 2px offset | 45% opacity, no pointer |
| Secondary `--secondary` | `heading` / `bg` | heading 86% | heading 76%, 1px drop | same | same |
| Outline `--outline` | transparent, 1.5px `line-strong` / `heading` | `tint` fill, border `heading` | 12% heading wash | same | same |
| Ghost `--ghost` | transparent / `heading` | `tint` | 14% heading wash | same | same |
| Light `--light` | 14% white glass, white border / white | 24% white | same, 1px drop | same | same |

- Shape: pill (`radius-full`). Sizes: small 44px (15px text), default 52px (16px), large 60px (17px). Horizontal padding 20 / 26 / 32px. Never smaller than 44px: every button is a comfortable touch target.
- Label: Figtree 650, sentence case. Icon 18px, 8px gap.
- Signature: `.tz-btn__chip`, a round chip at the end of the primary button holding `arrow-right` (or `send` on submit). It is a 16% tint of the label colour, so it works in every variant.
- Loading keeps the width, dims the label and spins `loader-circle`; `aria-busy="true"`.

## Service cards (CMS-driven)
- `.tz-service`: `surface`, 1px `line`, `radius-md`. Top: a `MediaSlot` at 4:3. Body: an icon chip that overlaps the photo edge by half (`tz-icon-chip--solid` with a 5px `surface` ring), the short subtitle in `highlight`, the title (`t-h4`), a two-line summary, and a footer row "Meer info" with a round arrow.
- Hover: lift 3px, `shadow-md`, photo zooms 4%, the arrow chip turns `accent` and tilts 45°. The whole card is one link (`::after` on the title link).
- `--featured`: the first service by `sort`, Forest colours, a 16:9 photo and a short checklist. Side by side with its text from 900px.
- `--compact`: no photo, icon chip inline. For services without a cover photo, or a dense overview page.
- One component, one record: every field maps to a `services` column (see **CMS, data and Svelte**). Seven or seventeen services, the grid fills itself.

## Form controls
- Inputs, selects and textareas: 52px tall, `radius-sm`, 1.5px `line-strong` border on `surface`, 16px side padding, 16px text.
- States: hover border `heading`; focus `accent` border plus a 3px 22% accent halo and the 2px `focus` ring for keyboard users; error `danger` border (2px effect), `aria-invalid="true"` and a message with `circle-x`; success `success` border with a `check` line; disabled `surface-sunken`, `ink-faint` text; read-only `surface-sunken` with a dashed border.
- Labels sit above the field (15px, 650). Hints in 14px `ink-faint`. Required `*` in `danger`; optional fields say **(optioneel)**.
- Checkbox 24px rounded square, radio 24px round, both fill with `accent` and an `on-accent` mark. Service tiles are checkbox cards with the service icon; checked: `accent` border, `tint` fill, ticked circle.
- File drop for garden photos: dashed `line-strong`, `surface-sunken`; drag-over turns `accent` and `tint`.
- Validation runs on submit, focuses the first error and clears each error as soon as the value is valid. No red before the visitor has tried.

## Iconography style
- Lucide line icons, 2px stroke, round caps and joins, 24px grid: open and friendly, matching the line drawing of the logo. Two custom icons in the same style: `mower` and `grass`.
- Icons rarely float alone: they sit in round icon chips (`tint` + `heading`, or `accent` + `on-accent`) that read as small stepping stones through the page.
- Brand marks (Google, Facebook, Instagram, WhatsApp) are filled Simple Icons, used only where the platform is the content.

## Navigation header and footer
- Header: 84px (68px under 1024px) on `surface` with a bottom hairline, sticky, `shadow-md` once scrolled. Logo 44px, four links as pills (hover `tint`, current page `tint` plus a leaf-green dot), the phone number with a phone chip (from 1180px), one small primary **Offerte aanvragen**. Under 1024px: a round menu button and a drawer with 26px Bricolage links and two full-width buttons; Escape closes it.
- Footer: Forest, local SEO first: brand column with social marks, Menu and Diensten link columns, the full NAP block (name, address, phone, e-mail, hours) as `<address>`, the service area as chips (each one a landing page), the Google Maps embed (loaded after consent), and the legal row with the BTW number.

## Badge and tag
- Badge: 28px pill, Figtree 700 12px uppercase with 0.06em tracking. Variants default (`tint`), solid (`heading`), glass (on photos), earth (`bark-100`), outline, and the four status badges with a 7px dot.
- Gallery categories: **Maaien**, **Gazon**, **Snoeien**, **Lamellen**, **Afboording**, **Materialen** (and **Onkruid** once there are photos).
- Filter tags (`.tz-tag`): 44px pills with `aria-pressed`; pressed fills with `heading`. Live count. On phones they scroll in one row.

## The rest
- **Hero** (inset rounded photo card, Forest overlay, Google score chip, display headline, quote side card, USP strip), **CTABand** (Forest card with a leaf shape), **ContactSection** (contact lines + tabbed quote and general forms), **SectionHeader** (leaf eyebrow pill), **ProjectGallery** (masonry with filter and lightbox), **ProcessSteps** (four numbered steps), **ReviewCard** (Google reviews with summary), **SocialFeed** (square post tiles), **MediaSlot** (fixed-ratio photo or labelled placeholder), **Card**, **Accordion** (FAQ), **Alert**, **Toast**.
