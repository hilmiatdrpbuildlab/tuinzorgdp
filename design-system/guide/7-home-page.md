# Home page layout

The high-fidelity home page is `home-page.html`, built from the same partials as the component previews. Press **Toon annotaties** (bottom left) to outline every section with its Svelte component and data source. The order below is the page from top to bottom; each block lists its theme, desktop layout, how it collapses on phones, content and data.

## 01 Header (sticky, Light surface)
- Desktop 84px: logo left (44px); nav pills **Home**, **Diensten**, **Realisaties**, **Contact** centred; right: phone chip with **0469 41 37 30** (from 1180px) and the small primary **Offerte aanvragen**.
- Tablet: logo, **Offerte aanvragen**, menu button. Phone 68px: logo and menu button only; the drawer holds the four links (26px Bricolage) and two full-width buttons: **Offerte aanvragen** and **Bel 0469 41 37 30**.
- Shadow appears after 8px of scroll. Escape closes the drawer; focus returns to the menu button.

## 02 Hero (Forest, inset photo card)
- A rounded card (`radius-xl`) 12px inside the viewport, up to 88% of the screen height, with the hero photo full-bleed (`gazon-gestreept-haag.jpg`, striped lawn between clipped hedges) under the left-to-right `overlay`.
- Desktop grid: copy (left, max 720px) and a glass quote card (right, 340px). Copy, top to bottom: Google score chip (G mark, five stars, score), display headline **Uw tuin, altijd verzorgd en mooi** with **altijd verzorgd** in `lime-300`, lead (2 lines), buttons **Gratis offerte aanvragen** (large primary with arrow chip) and **Bekijk ons werk** (light glass). Quote card: eyebrow **Gratis en vrijblijvend**, title, three check lines, phone button.
- Bottom strip across the card: three USPs from the current site, **Ervaring en kennis**, **Perfecte afwerking**, **Eerlijke prijzen**, each with a lime icon chip.
- Phone: card 8px from the edges; the quote card is hidden (the two hero buttons and the header do its job); buttons wrap full width; USPs stack. Headline 44px.
- Data: `settings.hero_image_id` (Media), `review_summary` for the chip (hide the chip until there is a score).

## 03 Waarom TuinZorg DP (Light)
- Desktop 5 / 7 split. Left: photo collage with mixed ratios, a 3:4 photo (corten edging) and a smaller 4:5 photo (the van) set lower. Right: leaf eyebrow pill, `t-h1` **Uw betrouwbare partner voor tuinonderhoud**, the owner's lead in the first person, the reasons in a two-column grid (Ervaring, Betrouwbaar, Persoonlijke aanpak, Duurzaam, Communicatie, Flexibiliteit; the CMS allows up to six, each with its own icon) and a text link.
- Phone: photos first, side by side; perks in one column.
- Data: `pages.home.about` text and two media ids; perks are fixed copy from the current site.

## 04 Diensten (Light surface, CMS)
- Section header: eyebrow **Onze diensten**, `t-h1` **Alles voor een verzorgde tuin**, lead; right: outline **Alle diensten**.
- Grid of `ServiceCard`s from `services`. Desktop (1100px+): three columns; the featured service (**Maaien en bosmaaien**) spans the full row in Forest with its 16:9 photo on the left two thirds and the text with a three-line checklist on the right; below it six cards in two rows of three, each with a 4:3 photo, overlapping icon chip, subtitle, title, summary and **Meer info**.
- Tablet: two columns, featured full width. Phone: one column, featured first.
- The eight services, in order: Maaien en bosmaaien (featured), Gazononderhoud (verticuteren en graszoden), Onkruidbestrijding, Snoeien, Aanplanten (borders, hagen en bomen), Lamellen plaatsen, Tuinafboording, Materialen invoeren. A service without a cover photo shows the empty `MediaSlot` until one is uploaded.

## 05 Realisaties (Light, CMS)
- Section header **Ons werk in uw buurt**, then a row of filter tags with counts (**Alles**, **Maaien**, **Gazon**, **Snoeien**, **Lamellen**, **Afboording**, **Materialen**).
- Masonry gallery: 4 columns desktop, 3 tablet, 2 phone. Ratios mix 3:4, 4:5, 1:1, 4:3 and 2:3 (from each photo's stored size, snapped to the nearest) so the columns stagger. Each tile: category badge (glass) top left; on hover a scrim caption with the title and an expand chip (always visible on touch screens).
- Click opens the lightbox: the photo at full size, title and category, previous / next (also arrow keys), close (also Escape and backdrop).
- 12 photos on the home page, then **Alle realisaties** (secondary) to `/realisaties`.
- Data: latest published `project_photos` with `role = 'after'` (and before/after pairs), joined to the service for the filter.

## 06 CTA band (Forest card on Light)
- Rounded Forest card inside the container: `t-h2` **Klaar voor een tuin waar u zorgeloos van geniet?** (accent word **zorgeloos**), lead; right: **Offerte aanvragen** (large primary) and the phone as an outline button. A large leaf shape bleeds off the bottom right corner at 16% opacity.
- Phone: stacked, buttons full width.

## 07 Werkwijze (Forest)
- Centred header **In vier stappen naar een verzorgde tuin**. Four step cards with number (01–04), icon chip, title and one sentence: Contact opnemen, Advies en bespreking, Uitvoering, Oplevering (the current site's steps). Dashed connectors between the cards on desktop.
- Tablet 2 × 2, phone one column.

## 08 Ervaringen en social (Sand)
- Header **Wat klanten zeggen**. Desktop: a summary card (Google mark, score in `t-stat`, five stars, review count, **Schrijf een review** button, link to all reviews) left at 340px, and a grid of up to six `ReviewCard`s (3 columns at 1240px, 2 below): stars, quote chip, text clamped to six lines, avatar initial, name, relative date, small G mark.
- Phone: summary card, then the cards as a horizontal swipe row with snap (86% wide, the next card peeks).
- Below: **Volg ons werk**, follow buttons (Instagram, Facebook, WhatsApp) and six square post tiles (6 / 3 / 2 columns) with the network mark; caption on hover.
- Data: `review_summary` and `reviews_cache` (Places API, refreshed nightly; only real reviews, unfiltered: show what Google shows); `social_posts`. If there are no reviews yet, hide the section rather than show placeholders.

## 09 Veelgestelde vragen (Light surface)
- 4 / 8 split: title **Goed om te weten**, lead and a link left; accordion right. The first question, **In welke gemeenten werkt TuinZorg DP?**, is open by default and names the service area (local SEO). Phone: stacked.
- Data: `faqs`, also emitted as `FAQPage` JSON-LD.

## 10 Contact en offerte (Light)
- Desktop 5 / 7 split. Left (sticky): eyebrow **Contact**, `t-h1` **Vraag uw gratis offerte aan**, lead, four contact lines (phone, e-mail, WhatsApp, werkgebied) as tappable rows with icon chips, and the van photo (16:9).
- Right: the form card (`radius-lg`, `shadow-md`) with a segmented switch **Offerte aanvragen** / **Algemene vraag**.
- Quote form, in order: service tiles (8, multi-select, at least one), Voornaam + Achternaam, Telefoon + E-mail, Adres van de tuin, Postcode (4 digits) + Gemeente, Gewenste timing + Oppervlakte tuin (both optional selects), Foto's van uw tuin (optional drop zone), Vragen en opmerkingen (600 characters, live count), privacy consent, then **Offerte aanvragen** (large, send chip) with the line "Gratis en zonder verplichting".
- General form: Naam + E-mail, Telefoon (optioneel), Uw vraag, **Bericht versturen**.
- On success the form is replaced in place by a confirmation panel that takes focus.
- Phone: copy and contact lines first, then the form card; every row single column; the service tiles in two columns.
- Data: posts to the `offerte` / `vraag` actions, writes `leads`, uploads to the bucket.

## 11 Footer (Forest, local SEO)
- Desktop: brand column (3/12: logo on dark, one line with the region, small **Offerte aanvragen**, social marks) and the link area (9/12, four columns): **Menu**, **Diensten** (all seven, each a link), **Contact** (two columns wide: name, address, phone, e-mail, hours in `<address>`), then **Werkgebied** (area chips, each a landing page) beside the Google Maps embed (16:9, loads after a click for cookie consent).
- Bottom row: © 2026 TuinZorg DP · BTW BE number; Privacybeleid, Cookies, Sitemap.
- Phone: brand, then Menu and Diensten side by side, then Contact, Werkgebied and the map full width.
- `LandscapingBusiness` JSON-LD in the `<head>` repeats the NAP, geo, area served, hours and services.

## Content the client still has to supply
Marked with the amber `.tz-todo` highlight on the page: street address, postcode and municipality, region, service areas (municipalities), opening hours, BTW number, Google score and review count (live), the Instagram handle and social URLs, a photo for weed control, and confirmation that the van photos may be used.
