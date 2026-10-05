# Database schema

Fifteen tables in one Neon Postgres database (region `aws-eu-central-1`, Frankfurt), defined in `src/lib/server/db/schema.ts`. Drizzle Kit generates the SQL migrations, which are committed and reviewed like code. Every content table has `created_at` and `updated_at` (set by a trigger) so the CMS can count unpublished changes. This replaces the sketch in `design-system/guide/5-cms.md`.

| Table | Holds | Key columns | Rules |
| --- | --- | --- | --- |
| `pages` | The fixed pages: home, diensten, realisaties, contact, privacy | `slug` (unique), `title`, `intro`, `body` (Markdown), `blocks` (jsonb), `hero_media_id`, `seo_title`, `meta_description`, `noindex` | Rows are seeded, never created or deleted in the CMS. `blocks` is validated per slug with a Zod schema. Home: `hero` (title, accent word, lead, three USPs), `about` (eyebrow, title, accent word, lead, four perks, two photos), `cta` (title, accent word, lead) |
| `services` | The seven services: Maaien en bosmaaien, Gazononderhoud, Onkruidbestrijding, Snoeien, Lamellen plaatsen, Tuinafboording, Materialen invoeren | `slug`, `title`, `short_label` (gallery filter and tiles, e.g. "Gazon"), `subtitle`, `summary` (≤ 160), `body`, `bullets` (jsonb string[], max 6), `icon` (enum: mower, grass, shovel, scissors, fence, ruler, layers), `cover_media_id`, `is_featured`, `sort_order`, `is_published`, SEO fields | At most one featured row (partial unique index). A service without a cover photo renders the empty `MediaSlot` |
| `projects` | Finished jobs | `slug`, `title`, `service_id` (FK), `service_area_id` (FK, nullable), `summary`, `body`, `cover_media_id`, `completed_on`, `is_featured`, `sort_order`, `is_published`, SEO fields | A project is published only with a cover photo and at least one gallery photo. The municipality is shown only when set |
| `project_media` | The photos of a project | `project_id`, `media_id`, `role` (`before` / `after` / `process` / `result`), `in_home_gallery`, `sort_order` | Cascade on project delete. The home gallery shows the 12 most recent `in_home_gallery` photos of published projects |
| `reviews` | Review cards | `quote`, `author_name`, `place`, `service_id` (nullable), `rating` (1–5), `source` (`google` / `direct`), `source_url`, `reviewed_on`, `consent_confirmed`, `sort_order`, `is_published` | Cannot be published unless `consent_confirmed` is true. Max 6 on the home page |
| `faqs` | FAQ items | `question`, `answer`, `service_id` (nullable = general), `show_on_home`, `sort_order`, `is_published` | |
| `service_areas` | Municipalities in the werkgebied | `name`, `slug`, `postcode`, `is_primary`, `intro` (Markdown), `sort_order`, `is_published`, SEO fields | One landing page `/tuinonderhoud/[slug]` per published row. Publishing needs an intro of at least 80 words, so no page is a copy of another |
| `social_posts` | Curated Instagram and Facebook posts | `network` (`instagram` / `facebook`), `url`, `media_id`, `caption`, `posted_on`, `sort_order`, `is_published` | The section shows the six newest; it is hidden when none is published |
| `media` | Every uploaded content file | `id`, `object_key`, `file_name`, `mime`, `bytes`, `width`, `height`, `alt`, `focal_x`, `focal_y`, `variants` (jsonb) | `alt` is required before any row using the file can be published. See [Media](04-media.md) |
| `media_usages` | Where each file is used | `media_id`, `owner_table`, `owner_id`, `field` | Rewritten in the same transaction as every save |
| `settings` | One row: company, contact, Google and socials | `company` (jsonb: name, street, postcode, city, region, VAT number, e-mail, phone, WhatsApp), `hours` (jsonb), `geo` (lat, lng), `socials` (jsonb), `google` (jsonb: place id, profile URL, write-review URL, rating, rating count, checked on), `maps_embed_url`, `notify_email` | `id boolean primary key check (id)` forces a single row |
| `redirects` | Old WordPress URLs and renamed slugs | `from_path` (unique), `to_path`, `status` (301 / 302), `note` | Written into the build as `_redirects` |
| `requests` | Quote requests and questions from the forms | `kind` (`offerte` / `vraag`), `first_name`, `last_name`, `email`, `phone`, `street`, `postcode`, `municipality`, `services` (text[]), `timing`, `garden_size`, `message`, `consent_at`, `status` (`nieuw` / `beantwoord` / `gepland` / `archief`), `notified_at`, `created_at` | Deleted with its files by the daily cron after 12 months. No IP address is stored. A row can be missing if Neon was down, but the mail is always sent first |
| `request_files` | Garden photos sent with a quote | `request_id` (FK, cascade), `object_key`, `mime`, `bytes`, `width`, `height` | Max 5 per request. Never public. Deleting a request deletes its objects |
| `builds` | Publish history | `status` (`pending` / `building` / `live` / `failed`), `trigger` (`cms` / `cron` / `push`), `triggered_at`, `finished_at`, `build_uuid`, `detail` | |

Better Auth adds its own tables (`user`, `session`, `account`, `verification`, `two_factor`), generated with its CLI into the same Drizzle schema.

SEO fields everywhere are `seo_title` (check: 62 characters or fewer) and `meta_description` (158 or fewer), as in TNL. Slugs are lowercase Dutch, unique per table, and changing one writes a row to `redirects` automatically.

The public site reads only published rows, and only at build time. The database is reached only from server code, with one role for the app (`tz_app`), one read-only role for the build (`tz_build`, content tables only, so never `requests`) and one read-only role for backups (`tz_backup`).

## Seed content

`scripts/seed-content.ts` writes the real content from the current site and the design system, and is idempotent:

- The seven services with the summaries, subtitles and checklist from `design-system/components/_partials/service-grid.html`.
- The home blocks, the four werkwijze steps (fixed in code, not a table) and the four FAQ answers from the design system.
- `settings`: phone `+32 469 41 37 30`, e-mail `info@tuinzorgdp.be`, WhatsApp `32469413730`; address, hours, VAT number, socials and service areas stay empty until the client supplies them (see [Decisions and open items](12-open-items.md)).
- `scripts/import-photos.ts` uploads the 45 client photos from `assets/` (originals, not the 1200 px copies in the design system) with the alt text and categories from `design-system/assets/photos/credits.json`, and creates one draft project per photo group for the client to complete.
