# Handover: running tuinzorgdp.be

For DRP BuildLab. How to set the site up, publish, reset the CMS password, restore a backup and rotate the unlock key. Every account (GitHub, Cloudflare, Neon, Brevo, Google Cloud) is held by the agency, not by one developer.

## 0. Current deployment (5 October 2026)

| What                         | Where                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Site (test, noindex)         | https://tuinzorgdp-website.goosebumpsevents.workers.dev                                                                                        |
| Worker                       | `tuinzorgdp-website`, Cloudflare account Info@drpbuildlab.com (crons 03:00 and 04:30 UTC)                                                      |
| Neon project                 | `tuinzorgdp` (`wispy-night-74195499`), org of hilmi.al-muhtade-billah@drpbuildlab.com, Frankfurt, Postgres 17, 0.25 CU                         |
| Branches                     | `main` (production), `dev` (copy of main)                                                                                                      |
| Bucket                       | `media` on `main`, private; credentials `tz-app-rw` (Worker) and `tz-build-ro` (build)                                                         |
| Turnstile                    | widget "tuinzorgdp forms" (managed) for the workers.dev host, tuinzorgdp.be and localhost                                                      |
| Local copies of every secret | `tuinzorgdp/.local/secrets/` on the machine that did the setup (git-ignored). Move them to the agency's password manager and delete the folder |

CMS account: `info@tuinzorgdp.be`, created with `--no-code`, so it signs in with the password only (behind the unlock link) because no mail service is connected. **Switch the e-mailed code back on as soon as Brevo works:** run `npm run seed:account` for the same address without `--no-code` (this also sets a new password).

Not done yet: Brevo (no API key, domain not authenticated, so notification mails and confirmations are not sent; requests are still stored and shown under Aanvragen), Workers Builds and its deploy hook (so **Publiceren** reports _Mislukt_), Cloudflare Web Analytics, R2 backups and the GitHub secrets. The code is not on GitHub yet; the Worker was deployed from a local build with `npx wrangler deploy`.

## 1. First setup (phase 0)

Do these once, in this order. Each ends with a check.

1. **Neon.** New project on the Free plan in `aws-eu-central-1` (`neon projects create --name tuinzorgdp --region-id aws-eu-central-1 --pg-version 17 --cu 0.25`), usage e-mails on.
   Create the roles **in SQL as the owner, not in the console or with `neon roles create`**: roles made there join `neon_superuser`, can read and write every table, and the owner cannot revoke that.
   `create role tz_app with login password '…'` (and the same for `tz_build`, `tz_backup`), then run the migrations with the owner role, which applies the grants:
   `DATABASE_URL_MIGRATE=<owner url> npm run db:migrate`. If the roles are created after the migrations, run the last `DO $$ … $$` block of `drizzle/0001_triggers_and_roles.sql` again.
   After dropping and recreating a role, restart the compute (`neon api /projects/<id>/endpoints/<ep>/restart -X POST`), or the pooler keeps sessions of the old role and refuses access.
   Create the `dev` branch from `main` afterwards (`neon branches create --name dev --parent main`), so it inherits the schema, roles, content and bucket.
   Check: `npm run check:roles` with `DATABASE_URL` (tz_app), `DATABASE_URL_BUILD` (tz_build) and `BACKUP_DATABASE_URL` (tz_backup) set: all three connect, tz_build and tz_backup are refused the insert, tz_build cannot read requests.
2. **Object Storage.** Each branch has its own S3 endpoint (`neon api /projects/<id>/branches/<branch id>/storage`), path-style, region `eu-central-1`. Create the private bucket: `neon api /projects/<id>/branches/<branch id>/buckets -X POST -F name=media -F access_level=private`. Credentials: `neon credentials create --branch main --name tz-app-rw --scope storage:read --scope storage:write` and `--name tz-build-ro --scope storage:read`; `token_id` is the access key id, `s3_secret_access_key` the secret (shown once; `neon credentials reveal` shows it again).
   Check: `npm run check:storage` (upload, read, delete with the first; write refused for the second).
3. **Content.** With `DATABASE_URL` and the `STORAGE_*` variables pointing at `main`: `npm run seed:content`, `npm run import:photos`, then `ADMIN_EMAIL=<owner> npm run seed:account` (prints a password once). Take the free Neon snapshot first if anything was already there.
4. **Cloudflare.** Create the Worker `tuinzorgdp-website` and connect Workers Builds to the GitHub repository:
   - Root directory: `tuinzorgdp`
   - Build command: `npm ci && npm run build`
   - Deploy command: `npx wrangler deploy && npm run mark-live`
   - Build variables (Settings, Builds): `DATABASE_URL_BUILD`, `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_READ_KEY_ID`, `STORAGE_READ_SECRET`, `PUBLIC_SITE_URL` (`https://tuinzorgdp-website.<account>.workers.dev`), `PUBLIC_CF_ANALYTICS_TOKEN`, `PUBLIC_TURNSTILE_SITE_KEY`.
   - Worker secrets (`npx wrangler secret put NAME`): `DATABASE_URL`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `BETTER_AUTH_SECRET` (32+ random bytes), `BETTER_AUTH_URL` and `PUBLIC_SITE_URL` (the site URL), `ADMIN_UNLOCK_KEY` (32+ characters), `BREVO_API_KEY`, `DEPLOY_HOOK_URL`, `TURNSTILE_SECRET`, `CRON_SECRET` (random), and `GOOGLE_PLACES_KEY` only if the Places API is approved.
   - Create a deploy hook for branch `main` (Settings, Builds, Deploy hooks) and store its URL as `DEPLOY_HOOK_URL`.
   - Cloudflare Web Analytics: add the site, copy the token into `PUBLIC_CF_ANALYTICS_TOKEN`. Turnstile: add a widget in "managed" mode for the workers.dev host (and later tuinzorgdp.be).
     Check: a push to `main` deploys; a pull request gets a preview URL.
5. **GitHub.** Branch protection on `main` requiring the `CI` workflow. Repository secrets for the backups: `BACKUP_DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `NEON_STORAGE_ENDPOINT`, `NEON_STORAGE_READ_KEY_ID`, `NEON_STORAGE_READ_SECRET`.
6. **R2.** Buckets `tz-backups` (lifecycle rule: delete after 30 days) and `tz-media-mirror`, with one token limited to these two buckets.
   Check: run `Nightly database backup` and `Weekly media mirror` by hand (Actions, Run workflow); a dump and the photos appear in R2.
7. **Brevo.** Authenticate `tuinzorgdp.be` (DKIM and verification records at whoever holds the DNS; check the existing SPF and DMARC first). Until Brevo shows it as authenticated, mail from `noreply@tuinzorgdp.be` may be rejected.

Local values go in `.env` (build and scripts) and `.dev.vars` (wrangler dev); see `.env.example`.

## 2. Publishing

The owner saves in the CMS and presses **Publiceren**. That inserts a `builds` row and calls the deploy hook. The build writes the row's id into `/build-info.json`; the CMS polls that file on the live site and only reports **Live** once it sees the id. No new id after 15 minutes means **Mislukt**: open the build log in Cloudflare (Workers & Pages, tuinzorgdp-website, Deployments). The unpublished changes stay counted, so nothing is lost; fix the cause and publish again. A second press while a build is queued does not start another.

A code push to `main` deploys the same way (trigger `push`).

## 3. Resetting the CMS password

```sh
DATABASE_URL=<tz_app url of main> ADMIN_EMAIL=<owner e-mail> npm run seed:account
```

It prints a new password once (or pass `-- --password "..."`), clears a lockout and signs out every session. Add `-- --no-code` to sign in with the password only (only while no mail service is connected). Send the password to the owner by phone or a separate message, never in the same message as the unlock link.

A locked account (too many wrong codes) unlocks by itself after 15 minutes; the reset above unlocks it at once.

## 4. Rotating the unlock key

1. `npx wrangler secret put ADMIN_UNLOCK_KEY` with a new random value of 32+ characters (the Worker restarts with it).
2. Every browser loses access to `/admin` (old gate cookies no longer match).
3. Send the owner the new link `https://<site>/admin/unlock?k=<new key>`; they open it once per browser.

## 5. Restoring a backup

Rehearse this once on the `dev` branch (phase 6) and note the date here.

**Database** (nightly dump in R2 `tz-backups`):

1. Download the dump: `aws s3 cp s3://tz-backups/tz-YYYY-MM-DD.dump.gz . --endpoint-url https://<account>.r2.cloudflarestorage.com` and `gunzip` it.
2. In Neon, create a scratch branch (or reset `dev`), and restore into it with the owner role:
   `pg_restore --no-owner --no-privileges --clean --if-exists -d "<owner url of the scratch branch>" tz-YYYY-MM-DD.dump`
3. Re-run the grants: `DATABASE_URL_MIGRATE=<owner url> npm run db:migrate` (migrations are already applied; to re-apply only the grants, run the second half of `drizzle/0001_triggers_and_roles.sql` in the Neon SQL editor).
4. Check: point `DATABASE_URL_BUILD` at the scratch branch and run `npm run build`; it must build the same site.
5. To make it live: promote the branch in Neon (or restore into `main` after taking the free snapshot), then publish once.

**A photo** (weekly mirror in R2 `tz-media-mirror`, `originals/` only):

`rclone copy r2:tz-media-mirror/originals/<uuid>.jpg neon:media/originals/` with the rclone remotes configured as in `.github/workflows/media-mirror.yml`. The `media` row still points at the same key, so publishing restores it on the site. Photos visitors sent with a request are not mirrored (personal data); the owner has each request by mail.

**Point-in-time:** Neon Free keeps 6 hours of history; for anything older use the dump.

## 6. Moving the domain (separate task)

When tuinzorgdp.be moves off WordPress: add the custom domain to the Worker, set `PUBLIC_SITE_URL`, `BETTER_AUTH_URL` and `SITE_INDEXABLE=true`, add the domain to the Turnstile widget, publish, then check `/robots.txt` allows crawling and the old WordPress URLs redirect (`_redirects`, managed in SEO & redirects). Add `preload` to the HSTS header in `_headers` only after the domain has been live for a while.

## 7. Regular checks

- `npm run e2e:admin` against a preview with throwaway rows after larger changes.
- `npm run build && npm run responsive` before handing over design changes.
- Neon console: compute hours and egress (each publish downloads the photos in use).
- Brevo: bounces on `noreply@tuinzorgdp.be`.
