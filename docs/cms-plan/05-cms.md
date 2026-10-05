# CMS at /admin

The CMS is reached by a direct link, `https://<site>/admin`, on the same domain as the site. There is no link to it on the public site, and `/admin` is `noindex` and disallowed in `robots.txt`.

## Getting in

Identical to TNL, so the code is reused as is:

1. **Unlock link.** `hooks.server.ts` checks the gate first. Opening `/admin/unlock?k=<ADMIN_UNLOCK_KEY>` sets an HttpOnly cookie (an HMAC of the key, 180 days, path `/admin`); without it every `/admin` request gets a plain-text 404 with no branding. This keeps a branded login form on a `*.workers.dev` URL from being flagged as phishing.
2. **E-mail + password.** Better Auth with public sign-up disabled. The one account is created by `scripts/seed-account.ts`, which also resets a forgotten password.
3. **One-time code by e-mail.** Better Auth's two-factor plugin sends a 6-digit code through Brevo, valid 5 minutes, *Code opnieuw sturen* after 60 seconds, device trusted for 30 days, lockout after repeated wrong codes. Sessions live in Neon, in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie scoped to `/admin`.

## Screens (labels in Dutch, as the client sees them)

| Screen | What the client does there |
| --- | --- |
| Overzicht | Sees unpublished changes, last publish status, new requests, and content gaps: photos without alt text, services without a photo, SEO text too long, reviews without consent, werkgebied pages without an intro |
| Aanvragen | The inbox for both forms, newest first, with a filter on **Offerte** / **Vraag** and on status (**Nieuw**, **Beantwoord**, **Gepland**, **Archief**). A request shows every field, the chosen services as tiles, the garden photos, and buttons to call, e-mail or open WhatsApp. CSV export. Requests older than 12 months are deleted automatically, and the screen says so |
| Pagina's | Edits the fixed pages: home hero (title, accent word, lead, three USPs), *Waarom TuinZorg DP* (text, four perks, two photos), the CTA band, the intros of Diensten, Realisaties and Contact, and the privacy text |
| Diensten | Edits each service: title, short label, subtitle, summary (counted, 160), checklist (repeatable rows), icon (picked from the seven), cover photo, featured switch, body, SEO, order |
| Realisaties | Adds, edits, orders and deletes projects: service, municipality, cover, photos with a role (voor, na, tijdens, resultaat) and a *Toon op home* switch, body, SEO. Dragging sets the order |
| Reviews | Adds review cards with a required *Klant gaf toestemming* checkbox before publishing, plus the source link |
| Google | Shows the rating and review count used on the site and when they were last checked. With the Places API: read-only, with a *Nu vernieuwen* button. Without it: two fields the client updates by hand |
| FAQ | Adds and orders questions, generally or per service, with a *Toon op home* switch |
| Werkgebied | Adds municipalities, orders them, writes the intro per landing page (counted, at least 80 words to publish), SEO |
| Social | Adds a post: picks a photo, pastes the Instagram or Facebook link, a short caption |
| Media | Browses all files with their usages and missing alt text; replaces or deletes unused files |
| SEO & redirects | Checks titles and descriptions per page; manages redirects |
| Instellingen | Company details (name, address, VAT number, phone, e-mail, WhatsApp), opening hours, socials, Google profile links, map location, the address that receives notifications |
| Account | Changes the password, signs out |

## Behaviour that applies everywhere

- **Save is not publish.** Saving writes to Neon only. A banner on every screen counts the changes that are not yet live, with a **Publiceren** button (see [Build, publish and deploy](07-build-and-deploy.md)). Requests are not content and never count.
- **Preview** renders the page with the draft data, using the real public components.
- **Deleting asks first**, in a dialog that names the item. End-to-end test for it, as in TNL.
- **Counted fields** show characters left against the 62 / 158 / 160 limits.
- **Publishing guards** are shown inline, not as errors after the fact: a project without a gallery photo, a review without consent, a photo without alt text, a werkgebied page under 80 words.
- The CMS UI uses the TuinZorg DP tokens, Light theme with Forest as its dark mode (as `design-system/guide/1-color.md` describes), and `admin.css` ported from One Man Agency. It does not need the public site's visual polish, but it uses the same Button, FormField, ChoiceControls, Badge, Alert and Toast components.
- Mobile friendly: the owner will mostly read requests and add projects from a phone on site. Aanvragen and Realisaties are tested at 375 px.
