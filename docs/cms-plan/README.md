# TuinZorg DP website and CMS: build plan

5 October 2026 · Hilmi Al-Muhtade-Billah

We are rebuilding tuinzorgdp.be (TuinZorg DP, garden maintenance for homes and businesses in Belgium) as one SvelteKit app. It has a prerendered public site built on the TuinZorg DP design system (`design-system/` in this repository), and a custom CMS at `/admin` on the same domain. It follows the TNL Project stack: Neon for the database and photos, Cloudflare for hosting and builds, Brevo for mail. The plan stops at a working site on a `*.workers.dev` URL; moving the domain off the current WordPress host is handled separately.

## Decisions already taken

| Area | Decision |
| --- | --- |
| Framework | SvelteKit + TypeScript, one app: public site, `/admin` CMS and API routes, in the existing repository `hilmiatdrpbuildlab/tuinzorgdp` next to `design-system/` |
| Rendering | Public pages prerendered from Neon at build time; the CMS **Publiceren** button triggers a rebuild |
| Database | Neon Postgres, accessed through Drizzle ORM with SQL migration files |
| Media | Neon Object Storage (S3-compatible), private bucket. Files are deleted when the client removes or replaces them |
| Hosting | Cloudflare Workers with static assets, built by Workers Builds from GitHub |
| Plans | Neon Free; the existing Cloudflare Workers Paid plan (as for TNL). No new monthly cost |
| Backups | Nightly database dump and weekly photo mirror to Cloudflare R2 |
| CMS access | Unlock link `/admin/unlock?k=…` once per browser, then e-mail + password + one-time code |
| Accounts | One CMS account, for the owner of TuinZorg DP |
| E-mail | Brevo, for login codes and new-request notifications |
| Language | Dutch (Flemish) only |
| Editable content | Pages, services, projects and photos, reviews, FAQ, service areas, social posts |
| CMS tools | Requests inbox (quotes and questions), media library, site settings, SEO + redirects |
| Lead forms | Two forms on one component: **Offerte aanvragen** (services, address, optional garden photos) and **Algemene vraag** |
| Design | TuinZorg DP design system v1 (`design-system/`): tokens, `tz.css`, 20 components, `home-page.html` as the reference page |

Reference implementations: the TNL Group plan (`TNL-Brief/docs/cms-plan`) and `DRPBuildLab/one-man-agency cms`. Reuse their CMS editors, publish banner, unlock gate, Brevo mail code and test scripts wherever they fit; this plan lists only what is different or specific to TuinZorg DP.

Where this plan and `design-system/guide/5-cms.md` differ (table names, the reviews source), this plan wins. Phase 1 updates the guide to match.

## Contents

1. [Architecture](01-architecture.md)
2. [Repository layout](02-repository.md)
3. [Database schema](03-database.md)
4. [Media](04-media.md)
5. [CMS at /admin](05-cms.md)
6. [Public site](06-public-site.md)
7. [Build, publish and deploy](07-build-and-deploy.md)
8. [Security and privacy](08-security.md)
9. [Environments and secrets](09-environments.md)
10. [Phases and tasks](10-phases.md)
11. [Testing and handover](11-testing-and-handover.md)
12. [Decisions and open items](12-open-items.md)
