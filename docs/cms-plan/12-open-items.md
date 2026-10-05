# Decisions and open items

Three lists: what is carried over from the approved TNL plan, what this plan proposes for TuinZorg DP and still needs the team's approval, and what needs an answer from the client.

## Carried over from TNL (decided)

| Item | Decision | Applies from |
| --- | --- | --- |
| Plans and cost | Neon Free + the existing Cloudflare Workers Paid plan, so no new cost. Neon autoscaling capped at 0.25 CU; usage e-mails on | Phase 0 |
| Object Storage in beta | Accepted, with a weekly copy of the content photos to R2 | Phase 0 |
| Backups | Nightly `pg_dump` to R2 with 30-day retention; the free Neon snapshot before every production migration | Phase 0 |
| Neon branches | Previews share the `dev` branch | Phase 0 |
| Hiding the test site | `noindex` and a blocking `robots.txt` on `*.workers.dev` | Phase 3 |
| Spam protection | Honeypot + Turnstile (invisible "managed") + rate limit of 5 per IP per 10 minutes | Phase 3 |
| Form reliability | The notification is sent before the row is written | Phase 3 |
| Upload rules (CMS) | 10 MB before scaling, scaled to 2400 px in the browser, JPEG / PNG / WebP only, no SVG, Dutch error messages | Phase 4 |
| CMS access | Unlock link, then password + 6-digit code by mail, valid 5 minutes, device trusted 30 days | Phase 4 |
| Retention | Requests deleted after 12 months, CSV export first | Phase 6 |
| Security headers and CSP | As in [Security and privacy](08-security.md) | Phase 6 |
| Quality targets | Lighthouse mobile 90 / 100 / 100 and LCP under 2.5 s | Phase 6 |

## Proposed for TuinZorg DP (to approve)

| Item | Proposal | Why | Applies from |
| --- | --- | --- | --- |
| Names | Repository `hilmiatdrpbuildlab/tuinzorgdp` (moved to the DRP BuildLab organisation before launch), Worker `tuinzorgdp-website`, roles `tz_*`, R2 buckets `tz-backups` and `tz-media-mirror` | Matches the existing repository and the TNL naming | Phase 0 |
| Google rating | A nightly cron reads the rating and review count through the Places API (New) and stores only the latest values; republish only on change. Fallback: the owner types them in the CMS | Live score in the hero without any Google script on the page. Needs a Google Cloud project with billing (one call a day, within Google's free monthly usage). Google's terms limit storing Places content and require attribution; check the current terms before turning it on | Phase 4 |
| Review cards | Entered in the CMS, copied from Google or received directly, each with the customer's consent and a link to the source (the TNL rule). No automatic import of review texts | Avoids storing Google review content, keeps control over which reviews show | Phase 4 |
| Social feed | Curated in the CMS (photo + link + caption), no Instagram or Facebook API | No tokens to renew every 60 days, no tracking embeds; the section hides when empty | Phase 4 |
| Two forms | **Offerte aanvragen** and **Algemene vraag** in one component, one endpoint, one inbox (`requests`) | As designed in `design-system/components/_partials/contact.html` | Phase 3 |
| Garden photos with a quote | Up to five, 10 MB each, private, deleted with the request | Lets the owner price small jobs without a visit | Phase 3 |
| Visitor confirmation mail | A fixed short text to the visitor after every valid request | Reassures the customer; guarded by the same rate limit | Phase 3 |
| Notification address | `info@tuinzorgdp.be` | The address on the current site | Phase 3 |
| Werkgebied pages | One page per municipality, published only with an 80-word intro of its own | Local SEO without thin duplicate pages | Phase 3 |
| Analytics | Cloudflare Web Analytics (cookieless); the map loads on click; no cookie banner | Privacy and speed | Phase 3 |
| Blog | Not at launch; the schema and routes leave room for it | No content planned yet | Later |

## Still open (needs the client)

- [ ] **DNS for tuinzorgdp.be.** Who holds it (the current WordPress host or a registrar), and access or a contact who can add Brevo's DKIM and verification records. Needed by phase 3. Check the domain's current SPF and DMARC first, so authenticated mail from Brevo is not rejected.
- [ ] **Business address**, and whether the street may be shown. If the owner works from home, the site and the Google profile can show the area only; the JSON-LD then leaves out the street. Needed by phase 2.
- [ ] **VAT / company number.** The team looks it up in the KBO register (kbopub.economie.fgov.be), the client confirms it. Needed by phase 2.
- [ ] **Opening hours** (or "op afspraak"). Needed by phase 2.
- [ ] **Werkgebied:** the main municipality and the others served, with a sentence or two about each for the landing pages. Needed by phase 3.
- [ ] **Google Business Profile:** does one exist, its link and place id, and agreement to use the Places API (or to update the score by hand). Needed by phase 4.
- [ ] **Social accounts:** the Instagram and Facebook URLs, if any. Needed by phase 2.
- [ ] **Reviews:** a few reviews with the customers' permission to show them, and where each comes from. Needed by phase 2.
- [ ] **Photos:** confirmation that every photo in `assets/` may be published (they show customers' gardens and houses), that the van photos may be used, and a photo for weed control. Needed by phase 2.
- [ ] **Owner name and story** for the *Waarom TuinZorg DP* section, and the e-mail address for the CMS account. Needed by phase 2.
- [ ] **Logo:** the original vector file, to replace the interim lockup in `design-system/assets/logo`. Needed by phase 3.
- [ ] **Privacy notice:** the team drafts a short Dutch notice (what is collected, including garden photos, why, 12 months, contact); the client approves it. Needed by phase 3.
- [ ] **Retention:** the client confirms that 12 months fits their own obligations (for example quotes that turned into invoices). Needed by phase 6.
