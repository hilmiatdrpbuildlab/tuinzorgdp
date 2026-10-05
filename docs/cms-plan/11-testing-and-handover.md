# Testing and handover

The site is ready to hand over when every check below passes on the production `*.workers.dev` URL.

| Check | Tool | Pass when |
| --- | --- | --- |
| Unit tests | Vitest | Media usage and deletion logic, request retention, slug to redirect, form validation (both forms, Belgian postcode, photo limits), publishing guards and SEO length rules are covered and green |
| Build verification | `scripts/verify-build.ts` | Every route exists, titles are 62 characters or fewer, descriptions 158 or fewer, JSON-LD parses and has the expected types, the NAP is identical on every page, the sitemap lists every published slug, no unpublished row appears, no request data appears anywhere in the output |
| Design fidelity | Playwright screenshots | The built home page matches `design-system/home-page.html` section by section at 1440, 768 and 390 px (reviewed by eye, not pixel-diffed) |
| Forms end to end | Playwright | A quote with three photos and a question each reach the inbox, the owner's mailbox and the visitor's mailbox; errors focus the first invalid field; the no-JS path lands on `/bedankt` |
| CMS end to end | Playwright (`scripts/e2e-admin.ts`, modelled on TNL's) | Sign-in with code, edit, preview, publish, delete with confirmation, image replace deletes the old object, a request's photos open and expire; runs against a preview, using throwaway rows only |
| Responsive | Playwright at 320, 375, 430, 768, 1024, 1440 px | No horizontal overflow, tap targets at least 44 × 44 px (the design system's rule), header collapses under 1024 px, the CMS Aanvragen and Realisaties screens work at 375 px |
| Accessibility | axe-core in Playwright | No serious or critical issues on any public page or CMS screen |
| Performance | Lighthouse, mobile | Performance 90+, Accessibility 100, SEO 100, and LCP under 2.5 s, on `/`, one service page, `/realisaties` and one werkgebied page |
| Privacy | Manual | No cookie is set on any public page before interaction; the map loads only on click; `/privacy` is approved by the client |
| Backups | Manual | Last night's dump is in `tz-backups`, this week's mirror is in `tz-media-mirror`, and the restore rehearsal passed |
| Security | securityheaders.com, manual | Grade A; `/admin` answers 404 without the unlock cookie; no secret appears in the client bundle (`grep` on the build output); a request photo cannot be fetched without a signed URL |

## Handover to TuinZorg DP

- The unlock link and the CMS login, sent separately.
- A short Dutch guide on the Overzicht screen: saving versus publishing, adding a realisatie with voor/na photos from a phone, answering a request, why alt text matters.
- One walk-through session with the owner, on their phone and on a laptop.
- For DRP BuildLab: `README.md`, `HANDOVER.md`, and access to GitHub, Cloudflare, Neon, Brevo and (if used) Google Cloud held by the agency, not by one developer.
