The design system for the new tuinzorgdp.be, built in SvelteKit with its content in Neon (PostgreSQL) and its photos in Neon Object Storage. TuinZorg DP does garden maintenance for homes and businesses in Belgium: mowing and brush cutting, lawn care, weed control, pruning, privacy slats in wire fencing, garden edging and spreading bark and gravel. The system is built on the company's own logo, the forest and leaf green of its current site, an earth brown, and its own job photos. It should feel the way a well-kept garden looks: tidy, healthy, cared for, and done by someone who isn't afraid of hard work.

Read this page first, then the guide sections: **Color system**, **Typography**, **Spacing, layout and responsive behaviour**, **Components and interaction**, **CMS, data and Svelte**, **CSS and Tailwind** and **Home page layout**. The finished home page is `home-page.html`; press **Toon annotaties** on it to see every section's component and data source.

## Brand and design philosophy

Personality: professional, trustworthy and reliable, accessible, eco-friendly, hardworking and rugged, friendly. The owner speaks in the first person on the current site ("Met passie voor groen en oog voor detail zorg ik…"): a craftsman, not a corporation.

- **Sage ground, forest type, one fresh green.** Pages sit on `sage-50` with `charcoal-800` body text and `forest-800` headings. `leaf-700` is the action colour (the primary button); `leaf-500`, the brand Leaf Green, is a mark colour only on Light because it fails contrast as text. One accent word per title takes `accent-word`.
- **Earth for warmth.** `bark-500` and the Sand theme (`sand-100`) bring soil and wood into the reviews and quote areas. Brown never carries an action.
- **Soft and sturdy.** Buttons are pills; cards round at `radius-md` (16px); the hero and CTA band at `radius-xl`. Headlines are Bricolage Grotesque at 92% width and weight 700–800: heavy enough to feel hands-on, friendly in its curves.
- **The leaf is the mark.** The small leaf shape (`.tz-leaf`) leads every eyebrow, comes from the sprout in the logo, and is the only ornament. The arrow-in-a-chip on primary buttons is the signature interaction.
- **Their work is the imagery.** Every photo is a TuinZorg DP job: striped lawns, clipped hedges, corten edging, fresh bark. No stock photos. Where a photo is missing, a `MediaSlot` shows the ratio and the CMS field it is waiting for.
- **Light page, Forest and Sand sections.** Build pages on Light. Switch whole sections with `data-theme="forest"` (hero, werkwijze, CTA band, footer) or `data-theme="sand"` (reviews and social). Never put two Forest sections back to back.

High-level rules for consistency:
- Components never use palette tokens directly; they use the semantic tokens (`bg`, `surface`, `surface-sunken`, `heading`, `ink`, `ink-soft`, `ink-faint`, `line`, `line-strong`, `accent`, `on-accent`, `accent-word`, `link`, `highlight`, `tint`, `focus` and the status pairs), which change with the theme.
- One primary action per view: **Offerte aanvragen**. A second action is an outline or light button, or a text link.
- Spacing comes from the 4px scale only (`space-3xs` to `space-5xl`).
- Every interactive element has a visible 2px `focus` ring at 2px offset and a touch target of 44px or more.
- Everything that moves respects `prefers-reduced-motion`.
- Build mobile first: the CSS starts at 4 columns and adds columns at `bp-sm` 640, `bp-md` 768, `bp-lg` 1024.

## Content and voice

- Dutch (Flemish), polite and warm: the reader is **u / uw**. The company speaks as **wij**, the owner may speak as **ik** in the about text.
- Short, concrete sentences in garden words: **maaien**, **bosmaaien**, **verticuteren**, **graszoden**, **gazon afpellen**, **snoeien**, **vormsnoei**, **lamellen**, **draadafsluiting**, **tuinafboording**, **cortenstaal**, **schors**, **grind**, **border**.
- The company's own claims, used as written on the current site: **Uw tuin, altijd verzorgd en mooi**, **Tuinonderhoud met passie**, **Ervaring en kennis**, **Perfecte afwerking**, **Eerlijke prijzen**, **gratis en zonder verplichting**. Never invent years of experience, project counts, guarantees, ratings, review texts, response times or service areas; ask the client. Placeholders the client must fill in are marked with `.tz-todo` (amber highlight) so they cannot ship unnoticed.
- Sentence case for every heading, button and nav item (no all-caps in content; eyebrows and badges get capitals from CSS).
- Buttons say what happens in two or three words: **Offerte aanvragen**, **Bekijk ons werk**, **Alle realisaties**, **Bericht versturen**.
- Phone shown as `+32 469 41 37 30` (or `0469 41 37 30` in tight spots), link `tel:+32469413730`; e-mail `info@tuinzorgdp.be`; WhatsApp `https://wa.me/32469413730`. Dates day first: **5 oktober 2026**. Areas with a comma and a space: **300 m²**.
- No emoji and no exclamation marks in UI copy. Errors say what went wrong and how to fix it, without apologising.

## Logo

- Files in `assets/logo`: `tz-logo.svg` (primary, Light and Sand), `tz-logo-on-dark.svg` (Forest and dark photos), `tz-mark.svg` (the hand-and-sprout on its forest tile: favicon, Google profile, social avatars), `tz-logo-mono-forest.svg` and `tz-logo-mono-white.svg`.
- The lockup is the hand-and-sprout mark, **TuinZorg DP** and the tagline **Tuinonderhoud met passie**. The mark is redrawn from the current logo as a clean line drawing; the words are set in Bricolage Grotesque and converted to paths (`src/build_logo.py`). It is an interim lockup: replace it with the client's original vector artwork when it is available.
- Minimum height 32px on screen (header 44px, footer 56px). Clear space on every side equals the height of the T in TuinZorg.
- Never recolour it outside these files, stretch it, outline it or put the primary version on a photo.

## Imagery

- 45 photos of the client's own work in `assets/photos/client`, named by what they show and grouped by service in `credits.json` (with Dutch alt text and the original file name). They are phone photos in portrait, resized to 1200px for this system; upload the originals to Neon Object Storage for the site.
- Crop with `object-fit: cover`. Ratios are fixed per slot: hero full-bleed, service cards 4:3 (featured 16:9), gallery 3:4, 4:5, 1:1, 4:3 and 2:3 mixed for the masonry rhythm, social tiles 1:1, about collage 3:4 + 4:5, map 16:9.
- Photos under text always get the hero `overlay` or the `scrim`.
- Alt text in Dutch describes what is visible: "Gebogen border met cortenstalen afboording rond een terras". Decorative photos take `alt=""`.
- Two photos in `Snoeien/` show the company van (`bestelwagen-*.jpg`): use them for trust (about, contact), not as pruning work. `gazon-strepen-terras.jpg` has the photographer's shadow; use it small or not at all. There is no photo for weed control yet; its card shows the empty `MediaSlot`.

## Iconography

- Lucide icons, inlined as SVG so they take `currentColor`, stroke 2, round caps: friendly, open line work that matches the logo's line drawing. 20px by default (`.tz-icon`), 18px in buttons, 24px in icon chips, 26px in service tiles.
- Icons sit in round **icon chips** (`.tz-icon-chip`: `tint` fill, `heading` icon; `--solid` uses `accent`).
- Fixed roles: `mower` (custom) for maaien, `grass` (custom) for gazononderhoud, `shovel` for onkruid, `scissors` for snoeien, `fence` for lamellen, `ruler` for afboording, `layers` for materialen; `arrow-right` in buttons and links, `phone`, `mail`, `map-pin`, `clock` for contact, `check` in lists, `star` and `quote` in reviews, `maximize-2` on gallery photos, `image-plus` in empty media slots, `info`, `circle-check`, `triangle-alert`, `circle-x` for status.
- Brand marks from Simple Icons (filled): Google, Facebook, Instagram, WhatsApp. Only in reviews, social and contact.
- Icons beside text get `aria-hidden="true"`; icon-only buttons get a Dutch `aria-label`.

## Motion and states

- Calm and natural, no bounce: colours `dur-fast` (140ms), arrows, card lift and accordions `dur-base` (220ms), photo zoom, lightbox and toasts `dur-slow` (380ms), all on `ease-out`.
- Signature interactions: the arrow in the button chip slides 3px right; a service card lifts 3px and its arrow chip turns green and tilts; a gallery photo zooms 4% and shows its caption; a pressed button drops 1px.
- Disabled is 45% opacity and no pointer. Loading keeps the button's width and spins `loader-circle` before the label.

## Accessibility

- Target WCAG 2.2 AA everywhere, AAA for body text: `ink` reaches 9.7:1 or more on every ground in every theme.
- Every text colour's usage note names the grounds it passes on, with the ratio; `src/check_contrast.py` checks all of them in every theme.
- Brand traps: white on `leaf-500` (the current site's button green) is only 2.8:1, so the primary button is `leaf-700` (5.7:1). `bark-500` is 3.5–4.6:1: borders, marks and large type only.
- Status never relies on colour alone: each badge, alert and toast has a word and an icon.
- Forms label every field above it, mark optional fields **(optioneel)**, link errors with `aria-describedby`, and move focus to the first error. Inputs are 16px so iOS does not zoom.

## Building with it

- Load `css/tokens.css`, then `css/tz.css`, then `js/tz.js`. Wrap the page in `body.tz`. Tailwind projects use `tailwind.config.js` on top of `tokens.css`.
- Each component's rules are in `components/<Name>/README.md` (with its Svelte props), its markup in `components/<Name>/preview.html`; the shared section markup is in `components/_partials`.
- `tokens.json` is the source of truth. After changing it run `python src/build.py` and `python src/check_contrast.py`.
