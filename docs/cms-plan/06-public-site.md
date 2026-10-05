# Public site

Every public route is prerendered (`export const prerender = true` on the `(public)` group) from published rows only. The pages are built from the design-system components; nothing is styled from scratch. `design-system/home-page.html` is the reference for the home page, section by section (`design-system/guide/7-home-page.md`).

| Route | Content from | Components, in page order |
| --- | --- | --- |
| `/` | `pages[home]`, services, home gallery photos, reviews, social posts, home FAQs, settings | Header, Hero, AboutSplit, ServiceGrid, ProjectGallery (12 photos), CTABand, ProcessSteps, GoogleReviews + SocialFeed, Accordion, ContactSection, Footer |
| `/diensten` | `pages[diensten]`, services | SectionHeader, ServiceGrid, ProcessSteps, CTABand, ContactSection |
| `/diensten/[slug]` | one service, its projects and FAQs | Hero (split variant, photos from its projects), body with the checklist, ProjectGallery filtered to the service, Accordion, ContactSection with the service tile pre-selected |
| `/realisaties` | `pages[realisaties]`, all published project photos | SectionHeader, ProjectGallery with the filter tags, links to project pages |
| `/realisaties/[slug]` | one project | Hero (split), voor/na photos side by side, gallery with lightbox, body, municipality link, related projects, CTABand |
| `/tuinonderhoud/[gemeente]` | one service area, services, projects in that area | Hero (split) "Tuinonderhoud in [gemeente]", the area intro, ServiceGrid, ProjectGallery for that area (hidden when empty), ContactSection with the municipality pre-filled |
| `/contact` | `pages[contact]`, settings | ContactSection, map (loaded on click), Accordion |
| `/privacy` | `pages[privacy]` | Article layout |
| `/bedankt`, `/formulier-fout` | fixed | Fallback pages for the forms without JavaScript |
| `/404` | fixed | SectionHeader, links to the four main pages |
| `/sitemap.xml`, `/robots.txt` | all published slugs | Generated at build |

The header CTA **Offerte aanvragen** links to `/contact#offerte`; on the home page it scrolls to the same form.

## Rules

- Contact details, hours, VAT number, socials and the Google links come from `settings` everywhere, never typed into a page. A missing value hides its line rather than showing a placeholder; the amber `.tz-todo` marks exist only in the design system.
- The Google rating chip in the hero and the review summary show only when `settings.google.rating` is set. The reviews section is hidden when there is neither a rating nor a published review card. The social section is hidden when no post is published.
- The map is a `MediaSlot` with a *Kaart laden* button; the Google Maps iframe loads only after a click, so no Google cookie is set before consent and no cookie banner is needed.
- Analytics: Cloudflare Web Analytics (cookieless). No Google Analytics.
- `js/tz.js` from the design system is replaced by Svelte actions with the same behaviour and keyboard support: header drawer and scroll shadow, gallery filter, lightbox (`<dialog>`, arrow keys, Escape), segmented tabs, character count, drop zone.

## The two forms

Both post to `/api/submit` (a Worker route, not prerendered) with a `kind` field. Fields follow `design-system/components/_partials/contact.html`:

- **Offerte aanvragen:** diensten (at least one), voornaam, achternaam, telefoon, e-mail, adres, postcode (4 digits), gemeente, vragen en opmerkingen (600 characters) and the privacy consent are required; gewenste timing, oppervlakte and up to five photos are optional.
- **Algemene vraag:** naam, e-mail and the question required; telefoon optional.

The route runs in this order, the same as TNL with one step added for photos:

1. Reject the request if the honeypot is filled, the Turnstile token fails, or the rate limit is hit (5 submissions per IP per 10 minutes, Cloudflare rate-limit binding).
2. Validate with Zod: the same Dutch messages as the client-side check, returned per field.
3. Store the garden photos in the bucket under `requests/` (see [Media](04-media.md)). A storage failure does not stop the request.
4. **Send the Brevo notification first**, to `settings.notify_email` (`info@tuinzorgdp.be` until the client says otherwise), from `noreply@tuinzorgdp.be`, with Reply-To set to the customer. The subject starts with *Offerte* or *Vraag* and the municipality, so the owner can triage from the phone. The mail links to the request in the CMS and never embeds raw HTML from the form.
5. Send the customer a short confirmation mail (*We hebben uw aanvraag goed ontvangen*).
6. Write the `requests` row and its `request_files`, with `notified_at` set if the mail went out. If Neon is asleep or over quota and the write fails, the owner has the mail; log the failure.
7. Return the success panel, or redirect to `/bedankt` without JavaScript. Show `/formulier-fout` only if both the mail and the write failed.

Turnstile runs in invisible "managed" mode.

## SEO (local first)

- `<title>`, meta description, canonical URL (`PUBLIC_SITE_URL` + path) and Open Graph image on every page.
- JSON-LD: `LandscapingBusiness` with name, address, geo, phone, opening hours, `areaServed` (published service areas) and `sameAs` on every page; `Service` per service page; `FAQPage` wherever FAQs show; `BreadcrumbList` on detail pages; `ImageGallery` on project pages. The NAP must match the Google Business profile character for character.
- The current WordPress site's URLs become `redirects` rows at seed time: `/ons-werk/` → `/realisaties`, the WordPress upload paths of the photos that move, and any service or page URL found in a crawl of the old site (phase 2 task). They are ready for the domain move.
- Until the domain move, the `*.workers.dev` build sends `noindex` and a `robots.txt` that blocks all crawlers.
