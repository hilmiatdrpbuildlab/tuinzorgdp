# Architecture

Visitors only ever load static files from Cloudflare. Neon is read by the build, and written only by the CMS and the two lead forms.

```mermaid
flowchart LR
  visitor["Website visitor<br/><small>any browser</small>"]
  owner["TuinZorg DP, CMS user<br/><small>direct link /admin</small>"]
  github["GitHub<br/><small>main + pull requests</small>"]

  subgraph cf["Cloudflare"]
    assets["<b>Static assets</b><br/>Prerendered pages, WebP images<br/>_redirects, _headers"]
    routes["<b>Worker routes</b><br/>/admin/* behind unlock link + login<br/>/api/submit for the quote and contact forms<br/>/api/publish, cron: media sweep, retention, Google"]
    builds["<b>Workers Builds</b><br/>build-images, prerender, verify<br/>reads Neon with a read-only role<br/>wrangler deploy, mark-live"]
  end

  brevo["<b>Brevo</b><br/>login codes, new-request mail"]
  google["<b>Google</b><br/>Places API: rating + count<br/><small>nightly cron (to confirm)</small>"]

  subgraph neon["Neon, Frankfurt"]
    pg["<b>Postgres</b><br/>content, auth, requests,<br/>builds, via Drizzle"]
    os["<b>Object Storage</b><br/>bucket media (private)<br/>photo originals, request photos"]
  end

  visitor -- pages --> assets
  visitor -- forms --> routes
  owner -- /admin --> routes
  github -- push --> builds
  routes -- deploy hook --> builds
  routes --> brevo
  routes --> pg
  routes --> os
  builds --> neon
  routes -.-> google
```

A save in the CMS writes to Postgres and Object Storage and leaves the live site unchanged. **Publiceren** calls the deploy hook; Workers Builds reads Neon, prerenders every page, copies the images and deploys new static assets. The only moving parts at request time are the Worker routes behind `/admin` and `/api`.

Two differences from TNL:

- **Visitors upload files.** The quote form accepts up to five garden photos. They go to the private bucket under `requests/`, are only ever shown inside `/admin`, and are deleted with the request (see [Media](04-media.md)).
- **Google rating without Google on the page.** If the Places API is approved (see [Decisions and open items](12-open-items.md)), a nightly Worker cron reads the rating and review count, stores them in `settings`, and republishes only when they changed. The build reads them from Neon like any other content. Visitors never call Google, so there is no Google script or cookie on the public site; the map loads only after a click.
