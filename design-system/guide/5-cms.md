# CMS, data and Svelte

The site is SvelteKit. Content lives in PostgreSQL on Neon; photos live in Neon Object Storage and the database only stores their keys and dimensions. Every CMS-driven block on the home page reads from one table, so the client adds a service, a project or a service area without touching code.

## Principles
- **One component, one record.** A `ServiceCard` renders one `services` row; a `GalleryShot` renders one `project_photos` row. Props are named after columns.
- **Photos carry their size.** Store `width` and `height` with every image. The gallery uses them for the masonry ratio and to set `width`/`height` on `<img>`, so nothing jumps while loading.
- **Photos need words.** A photo cannot be published without Dutch alt text; the CMS shows how many are missing.
- **Placeholders are visible.** A record without a photo renders `MediaSlot` in its empty state (ratio + field name), never a broken image.
- **No invented content.** Reviews come only from Google (cached), never typed in by hand.

## Tables (PostgreSQL)

```sql
create table media (
  id           uuid primary key default gen_random_uuid(),
  storage_key  text not null unique,          -- e.g. projects/2026/cortenstaal-border.jpg in the bucket
  width        int  not null,
  height       int  not null,
  alt_nl       text not null default '',      -- required before publishing
  focal_x      real default 0.5,              -- object-position for crops (0..1)
  focal_y      real default 0.5,
  created_at   timestamptz default now()
);

create table services (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,        -- maaien-en-bosmaaien
  title          text not null,               -- Maaien en bosmaaien
  subtitle       text,                        -- Strak gazon, nette randen
  summary        text not null,               -- max 160 characters, shown on the card
  body           text,                        -- markdown for /diensten/[slug]
  bullets        text[] default '{}',         -- "Wat we doen" list, featured card shows 3
  icon           text not null,               -- mower | grass | shovel | scissors | fence | ruler | layers
  cover_image_id uuid references media(id),   -- null renders the empty MediaSlot
  featured       boolean default false,       -- one at a time
  sort           int  default 0,
  published      boolean default true
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  service_id  uuid references services(id),  -- drives the gallery filter
  municipality text,                          -- local SEO: "in [gemeente]"
  done_on     date,
  published   boolean default false
);

create table project_photos (
  project_id  uuid references projects(id) on delete cascade,
  media_id    uuid references media(id),
  role        text default 'after',           -- before | after | process
  sort        int default 0,
  primary key (project_id, media_id)
);

create table service_areas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                  -- gemeente
  postcode    text,
  slug        text unique not null,           -- /tuinonderhoud/[slug] landing page
  is_primary  boolean default false,
  sort        int default 0
);

create table reviews_cache (                  -- filled nightly from the Google Places API
  google_review_id text primary key,
  author_name text, author_photo text, rating int, text_nl text,
  relative_time text, published_at timestamptz, fetched_at timestamptz default now()
);
create table review_summary (place_id text primary key, rating numeric(2,1), total int, fetched_at timestamptz);

create table social_posts (                   -- optional: filled from the Instagram / Facebook Graph API
  id text primary key, network text, permalink text, media_id uuid references media(id), caption text, posted_at timestamptz
);

create table leads (                          -- every quote and contact form
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,                  -- offerte | vraag
  first_name text, last_name text, phone text, email text not null,
  street text, postcode text, municipality text,
  services    text[] default '{}',
  timing text, garden_size text, message text not null,
  photo_keys  text[] default '{}',            -- uploads in the bucket under leads/
  consent     boolean not null,
  status      text default 'nieuw',           -- nieuw | beantwoord | gepland | archief
  created_at  timestamptz default now()
);

create table settings (key text primary key, value jsonb);  -- NAP, opening hours, BTW, socials, maps_embed_url, place_id
create table faqs (id uuid primary key default gen_random_uuid(), question text, answer text, sort int, published boolean default true);
```

## Images from Neon Object Storage
- Store the key, build the URL: `PUBLIC_MEDIA_BASE_URL + storage_key`. Keep the base URL in an environment variable so a CDN or image proxy can be put in front later.
- Generate three widths on upload (480, 960, 1600) as `-480.webp`, `-960.webp`, `-1600.webp` next to the original, and serve them with `srcset`. `sizes` per slot: hero `100vw`; service card `(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw`; gallery `(min-width: 1100px) 25vw, (min-width: 768px) 33vw, 50vw`; social `(min-width: 1024px) 16vw, 50vw`.
- The hero image gets `fetchpriority="high"` and no lazy loading; everything else `loading="lazy"` and `decoding="async"`.
- Uploads from the quote form go through a server endpoint (`/api/upload`) that checks type (JPEG, PNG) and size (10 MB, 5 files) and writes to `leads/` in the bucket. Never expose bucket credentials to the browser.

## SvelteKit structure

```text
src/
  lib/components/
    Button.svelte  Header.svelte  Footer.svelte  Hero.svelte  SectionHeader.svelte
    ServiceGrid.svelte  ServiceCard.svelte  ProjectGallery.svelte  GalleryShot.svelte  Lightbox.svelte
    ProcessSteps.svelte  GoogleReviews.svelte  ReviewCard.svelte  SocialFeed.svelte
    ContactSection.svelte  QuoteForm.svelte  ContactForm.svelte  FormField.svelte  ServiceTiles.svelte
    MediaSlot.svelte  Badge.svelte  Card.svelte  Accordion.svelte  Alert.svelte  Toast.svelte  CTABand.svelte
  lib/server/db.ts            -- Neon serverless driver, one pooled connection string
  lib/server/storage.ts       -- bucket client, signed uploads
  lib/media.ts                -- url(key, width), srcset(media)
  routes/+layout.server.ts    -- settings (NAP, socials) for Header and Footer
  routes/+page.server.ts      -- home: services, latest project photos, reviews, faqs; actions: offerte, vraag
  routes/diensten/[slug]/     -- service detail
  routes/realisaties/         -- full gallery with filter in the URL (?dienst=snoeien)
  routes/tuinonderhoud/[gemeente]/  -- local landing pages from service_areas
  app.css                     -- imports tokens.css and tz.css (or Tailwind on top of tokens.css)
```

## Component props

| Component | Props | Source |
| --- | --- | --- |
| `Header` | `current`, `phone`, `quoteHref` | settings |
| `Hero` | `title`, `accentWord`, `lead`, `image: Media`, `rating?: {score, total}`, `usps: string[]` | settings + review_summary |
| `ServiceGrid` | `services: Service[]` | services where published order by featured desc, sort |
| `ServiceCard` | `slug`, `title`, `subtitle`, `summary`, `bullets`, `icon`, `cover?: Media`, `featured` | one services row |
| `ProjectGallery` | `photos: GalleryPhoto[]`, `filters: {value, label, count}[]`, `limit` | project_photos join projects join services |
| `GalleryShot` | `media: Media`, `title`, `category`, `ratio` | one row; ratio from width/height, snapped to 3:4, 4:5, 1:1, 4:3, 2:3 |
| `GoogleReviews` | `summary: {score, total, url}`, `reviews: Review[]` (max 6) | review_summary, reviews_cache |
| `SocialFeed` | `posts: Post[]` (6), `links: {instagram, facebook, whatsapp}` | social_posts, settings |
| `QuoteForm` | `services: {slug, title, icon}[]`, `form` (action result) | services; posts to `?/offerte` |
| `Footer` | `nap`, `hours`, `areas: Area[]`, `services`, `socials`, `vat`, `mapsEmbedUrl` | settings, service_areas, services |
| `MediaSlot` | `media?: Media`, `ratio`, `field` (shown when empty), `sizes`, `priority` | any |

## Forms
- SvelteKit form actions with progressive enhancement (`use:enhance`): the form works without JavaScript; with it, it validates inline and shows the success panel in place.
- Server validation repeats every client rule (required fields, e-mail, Belgian postcode `^[1-9][0-9]{3}$`, at least one service, consent) and returns field errors in Dutch, with the same wording as the client messages.
- A honeypot field and a time-to-submit check against spam; no CAPTCHA that blocks people.
- Each lead sends an e-mail to `info@tuinzorgdp.be` and a short confirmation to the visitor.

## Local SEO
- `LocalBusiness` (`LandscapingBusiness`) JSON-LD in the layout from `settings` (see the `<head>` of `home-page.html`); `FAQPage` JSON-LD from `faqs`; `Service` JSON-LD on each service page.
- One landing page per `service_areas` row: title "Tuinonderhoud in [gemeente]", the services grid, projects done in that municipality (`projects.municipality`) and the contact section.
- The NAP block in the footer must match the Google Business profile character for character.
