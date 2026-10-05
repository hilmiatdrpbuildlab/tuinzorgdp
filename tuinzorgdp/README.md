# TuinZorg DP website and CMS

The new tuinzorgdp.be: one SvelteKit app with a prerendered public site built on the TuinZorg DP design system (`../design-system`) and a CMS at `/admin` on the same domain. Content and photos live in Neon (Postgres + Object Storage), the site runs as a Cloudflare Worker with static assets, mail goes through Brevo. The build plan is in `../docs/cms-plan/README.md`; operations (publishing, password reset, restore, key rotation) are in [HANDOVER.md](HANDOVER.md).

## Run it locally

Node 22 or later. No accounts are needed: without a database the dev server uses PGlite (Postgres in WebAssembly) in `.local/pglite`, without a bucket it stores files in `.local/storage`, and without a Brevo key mails (including login codes) are printed in the terminal.

```sh
npm install                     # if npm 10 fails with "Cannot read properties of null (reading 'edgesOut')", use: npx npm@11 install
npm run seed:content            # pages, services, FAQ, settings, redirects
npm run import:photos           # the 45 client photos from ../assets, as draft projects
ADMIN_EMAIL=you@example.be npm run seed:account -- --password "a long passphrase"
npm run dev                     # http://localhost:5173, CMS at /admin (gate off locally)
```

The seed and import scripts open the same PGlite database as the dev server, and PGlite allows one process at a time: stop `npm run dev` before running them.

## Commands

| Command                                         | Does                                                                                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                   | Dev server                                                                                                                                                        |
| `npm run build`                                 | `sync:ds --check`, `build:files` (build-info.json, `_redirects`), `build:images` (WebP variants), `vite build` (prerender), `build:wrap` (cron handler), `verify` |
| `npm run check` / `npm run lint` / `npm test`   | svelte-check / Prettier + ESLint / Vitest                                                                                                                         |
| `npm run e2e:admin`                             | Starts the dev server and runs the CMS and forms end to end (needs `ADMIN_EMAIL`, `ADMIN_PASSWORD`)                                                               |
| `npm run responsive`                            | After a build: overflow, tap targets, header, cookies and axe-core at 320 to 1440 px                                                                              |
| `npm run screenshot -- / /diensten`             | Full-page screenshots of the build at 1440, 768 and 390 px                                                                                                        |
| `npm run sync:ds`                               | Copies tokens.css, tz.css, fonts, logos and icons from `../design-system`                                                                                         |
| `npm run db:generate` / `npm run db:migrate`    | Drizzle migrations (`drizzle/`); migrate uses `DATABASE_URL_MIGRATE` (owner role)                                                                                 |
| `npm run seed:account`                          | Creates the CMS account or resets its password                                                                                                                    |
| `npm run scrub:dev -- --yes`                    | Deletes every request on the `dev` branch after a reset                                                                                                           |
| `npm run check:roles` / `npm run check:storage` | Phase 0 checks for the three database roles and the two storage credentials                                                                                       |

Without `DATABASE_URL_BUILD`, `npm run build` builds from the seed content (`src/lib/server/seed-data.ts`), with the draft projects shown, so the build works offline and in CI.

## SEO and GEO

SEO is edited in the CMS (title, description and slug per page, SEO & redirects, Werkgebied landing pages, company details in Instellingen); the sitemap, `robots.txt`, canonical URLs and JSON-LD are generated at build. For generative search engines (GEO), `/llms.txt` ([llmstxt.org](https://llmstxt.org)) is generated at every build from the published content by `src/lib/llms.ts`: services, realisaties, werkgebied, FAQ and contact details, so it needs no separate editing. Until `SITE_INDEXABLE=true`, `robots.txt` blocks every crawler, AI crawlers included.

## Layout

```
src/lib/components/        Public components, ported 1:1 from ../design-system (class names and tokens unchanged)
src/lib/components/admin/  CMS components and admin.css
src/lib/styles, fonts      Copies from the design system (never edit; change the design system, then npm run sync:ds)
src/lib/icons/             Icon.svelte + icons.ts generated from the design system's SVGs
src/lib/server/            db (Drizzle schema, clients), content and page-data (shared by the build and the CMS preview),
                           auth (Better Auth), gate (unlock link), mail (Brevo), storage (S3 via aws4fetch), media,
                           requests (the two forms), publish, cron, cms (usages, change log, slugs)
src/routes/(public)/       Prerendered site
src/routes/admin/          CMS (gate + login + screens), preview, API
src/routes/api/            /api/submit (forms), /api/cron/* (called by the Worker's scheduled handler)
scripts/                   Build, seed, import, verification and test scripts
drizzle/                   Committed SQL migrations (0001 adds the updated_at triggers and the role grants)
```

## Where this differs from the plan, and why

- **App folder.** The app lives in `tuinzorgdp/` next to `design-system/`, not at the repository root. In Workers Builds set the root directory to `tuinzorgdp`; the GitHub workflows use `working-directory: tuinzorgdp`.
- **SvelteKit 2, not 3.** SvelteKit 3.0 had just been released and Better Auth does not support it yet.
- **Rate limit.** Cloudflare's rate-limit binding only allows 10 s or 60 s periods, so `SUBMIT_LIMITER` is 5 per 60 s (bursts) and the 10-minute window of 5 is counted in Postgres (`submit_attempts`, an HMAC of the IP and the hour, deleted after 10 minutes; never the IP).
- **Publish endpoint at `/admin/api/publish`.** The session cookie is scoped to `/admin`, so `/api/publish` would never see it.
- **Database driver.** The Worker uses Neon's WebSocket pool per request, so CMS saves and their `media_usages` run in one transaction; the build reads with the HTTP driver.
- **Unpublished changes** are counted from a `content_changes` log (also catches deletions), not only from `updated_at`.
- **Gallery ratios.** All client photos are portrait, so snapping alone gives only 3:4; portrait photos follow the rhythm of `home-page.html` so the masonry staggers.
- **Forms without JavaScript** cannot run Turnstile; they are accepted with the honeypot and the rate limit (`ALLOW_NOJS_SUBMIT=false` turns this off).
- **tz_build** may insert and update its own `builds` row (write-build-files and mark-live), and nothing else.
- **Design system fixes** made while testing: grid items that could not shrink below their content (hero, contact, about photos) and the service-card subtitle colour (`highlight`, 3.9:1, now `accent-word`, 5.3:1). Made in `../design-system/css/tz.css` and synced.
