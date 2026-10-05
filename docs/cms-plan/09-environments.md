# Environments and secrets

There are three environments, each with its own Neon branch, so no test ever touches the client's content or requests.

| Environment | Code | Neon branch | URL |
| --- | --- | --- | --- |
| Local | any branch, `npm run dev` | `dev` (a child of `main`) | `localhost:5173` |
| Preview | pull requests (Workers Builds) | `dev` (shared) | preview URL per build, optionally behind Cloudflare Access |
| Production | `main` | `main` | `tuinzorgdp-website.<account>.workers.dev` until the domain move |

Plans: a new Neon project on the Free plan and the existing Cloudflare Workers Paid plan. On Neon, cap autoscaling at 0.25 CU on every branch and turn on the usage e-mails; running out of compute suspends the database, but the static site stays up and the forms still mail the owner.

The `dev` branch is reset from `main` before each test round, then `scripts/scrub-dev.ts` deletes all `requests` and their files on `dev`, so real customer data never sits in a preview environment.

Locally, values live in `.dev.vars` (git-ignored, with an `.env.example` committed). In Cloudflare, a secret is set with `wrangler secret put` or in the dashboard, and a build variable under Settings, Builds.

| Variable | Used by | Kind | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Worker | secret | `tz_app` role, pooled connection string |
| `DATABASE_URL_BUILD` | build | build secret | `tz_build` read-only role |
| `STORAGE_ENDPOINT`, `STORAGE_BUCKET` | Worker, build | variable | Neon Object Storage endpoint; bucket `media` |
| `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` | Worker | secret | Credential with read + write |
| `STORAGE_READ_KEY_ID`, `STORAGE_READ_SECRET` | build | build secret | Read-only credential |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Worker | secret / variable | 32+ random bytes; the site URL |
| `ADMIN_UNLOCK_KEY` | Worker | secret | 32+ characters. Empty locally = gate off; deployed without it, `/admin` stays closed |
| `BREVO_API_KEY`, `MAIL_FROM`, `MAIL_FROM_NAME` | Worker | secret / variable | `MAIL_FROM` = `noreply@tuinzorgdp.be`, domain authenticated in Brevo; name `TuinZorg DP` |
| `MAIL_REPLY_TO` | Worker | variable | `info@tuinzorgdp.be` (login mail and visitor confirmations; notifications reply to the customer) |
| `DEPLOY_HOOK_URL` | Worker | secret | Anyone holding it can start builds |
| `PUBLIC_SITE_URL` | build | variable | Canonical URLs and JSON-LD |
| `PUBLIC_CF_ANALYTICS_TOKEN` | build | variable | Cloudflare Web Analytics beacon |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` | build, Worker | variable / secret | Invisible "managed" widget |
| `GOOGLE_PLACES_KEY` | Worker (cron) | secret | Only if the Places API is approved. Restricted to Places API (New) |
| `SUBMIT_LIMITER` | Worker | rate-limit binding | 5 requests per IP per 600 s, in `wrangler.jsonc` |
| `BACKUP_DATABASE_URL` | GitHub Actions | repository secret | `tz_backup` role, for `db-backup.yml` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | GitHub Actions | repository secrets | R2 token limited to `tz-backups` and `tz-media-mirror` |
| `NEON_STORAGE_READ_KEY_ID`, `NEON_STORAGE_READ_SECRET` | GitHub Actions | repository secrets | Read-only storage credential, for `media-mirror.yml` |
| `ADMIN_EMAIL` | `seed-account` script only | local | Never deployed |

The unlock link and the CMS login go to the client separately, the gate first.
