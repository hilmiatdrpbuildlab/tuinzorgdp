# Repository layout

One GitHub repository, `hilmiatdrpbuildlab/tuinzorgdp` (already created, holding `design-system/`). The SvelteKit app lives at the root, next to the design system, and mirrors the TNL and One Man Agency layout so code moves across. Route groups keep the prerendered site and the dynamic CMS apart. Before launch, transfer the repository to the DRP BuildLab organisation so access is not tied to one developer.

```
design-system/             The design system (tokens.json, css/, components/, guide/). Source of truth for visuals
docs/cms-plan/             This plan
src/
  app.d.ts                 Platform bindings and Locals (session, user)
  hooks.server.ts          Unlock gate for /admin, then session lookup
  lib/
    styles/                tokens.css, tz.css copied from design-system/css by scripts/sync-design-system.ts (never edited here)
    fonts/                 BricolageGrotesque-Variable.woff2, Figtree-Variable.woff2
    components/            Public blocks: Header, Hero, SectionHeader, ServiceGrid, ServiceCard, ProjectGallery, GalleryShot,
                           Lightbox, ProcessSteps, GoogleReviews, ReviewCard, SocialFeed, Accordion, CTABand,
                           ContactSection, QuoteForm, ContactForm, ServiceTiles, FormField, MediaSlot, Footer …
    components/admin/      CMS editors: ImageField, MediaPicker, GalleryEditor, RepeatRows, CountedField, SeoPanel,
                           PublishBanner, ConfirmDialog, RequestView
    icons/                 Lucide + mower, grass + brand marks as Svelte components
    server/
      db/schema.ts         Drizzle schema (source of the migrations)
      db/client.ts         Neon HTTP client per request
      content.ts           Build-time reads for the public site
      google.ts            Places API read (rating and review count), used only by the nightly cron
      storage.ts           Neon Object Storage client (S3 SDK)
      media.ts             Upload, variants, reference check, delete
      requests.ts          Quote/contact handling: validation, photo upload, mail, insert
      auth.ts              Better Auth: e-mail + password + e-mail OTP second factor
      gate.ts              Unlock-link gate
      mail.ts              Brevo transport and the two mail templates
      publish.ts           Deploy hook call + build status
    seo.ts, schema-org.ts  Meta tags and JSON-LD
  routes/
    (public)/              Prerendered: /, /diensten, /diensten/[slug], /realisaties, /realisaties/[slug],
                           /tuinonderhoud/[gemeente], /contact, /privacy, /bedankt, /formulier-fout, sitemap.xml, robots.txt
    admin/                 The CMS. Never prerendered; login required
    api/submit/            Quote and contact form POST
    api/publish/           Publish button (server only)
    dev/components/        Dev-only component gallery (excluded from production builds)
.github/workflows/
  ci.yml                   check, lint, unit tests on every pull request
  db-backup.yml            Nightly pg_dump to R2 (02:30)
  media-mirror.yml         Weekly rclone copy of the media bucket to R2 (Sunday 04:00)
drizzle/                   Generated SQL migrations, committed
scripts/                   sync-design-system.ts, seed-account.ts, seed-content.ts, import-photos.ts, scrub-dev.ts,
                           build-images.ts, verify-build.ts, e2e-admin.ts, responsive.ts
static/                    favicon (tz-mark.svg), robots fallback
wrangler.jsonc
```

## Conventions

- TypeScript `strict`. `npm run check` (svelte-check) and `npm run lint` must pass before merge.
- Components are ported from `design-system/components/*/preview.html` and `components/_partials/*.html` one to one. The class names (`tz-btn`, `tz-service`, `tz-shot` …) and the tokens stay as they are, and the props follow the table in `design-system/guide/5-cms.md`. A visual change goes into the design system first, then `npm run sync:ds` copies the CSS.
- Database column names are English `snake_case`. Everything the client and visitors see is Dutch.
- Branches: `main` deploys production; each pull request gets a preview build. Commits follow Conventional Commits.
