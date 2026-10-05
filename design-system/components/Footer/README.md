# Footer

The Forest footer, built for local SEO: brand and socials, Menu and Diensten links, the full NAP block, the service area as landing-page chips, the Google Maps embed and the legal row.

## Use
- Markup in `components/_partials/footer.html`. The address is a real `<address>` with name, street, postcode and municipality, phone, e-mail and hours: it must match the Google Business profile exactly.
- **Werkgebied** chips come from `service_areas`; each links to `/tuinonderhoud/[gemeente]`.
- The map is a `MediaSlot` (16:9) until the visitor clicks it, then the iframe from `settings.maps_embed_url` loads (no Google cookies before consent).
- The legal row carries the BTW number (BE + 10 digits), Privacybeleid, Cookies and Sitemap.

## Responsive
- Phone: brand; Menu and Diensten side by side; Contact, Werkgebied and the map full width. Tablet: three columns. Desktop: brand 3/12, links 9/12 in four columns, Werkgebied beside the map.

## Svelte
`Footer.svelte`: `nap: {name, street, postcode, city, country}`, `phone`, `email`, `hours`, `areas: {name, slug}[]`, `services: {title, slug}[]`, `socials`, `vat`, `mapsEmbedUrl`. Data from `+layout.server.ts`.

## Avoid
- A different address format here than in the JSON-LD or on Google.
- Loading the map iframe on page load.
