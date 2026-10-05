# Header

The sticky site header: logo, four nav pills, the phone number and one small primary **Offerte aanvragen**. A round menu button and a drawer below 1024px.

## Use
- Markup in `components/_partials/header.html`. The current page link gets `aria-current="page"`: `tint` pill plus a small leaf-green dot.
- Links: **Home**, **Diensten**, **Realisaties**, **Contact**. The CTA is always visible from 640px; the phone appears from 1180px.
- `js/tz.js` toggles `data-open` on the menu button (Escape closes it) and adds `.is-scrolled` (shadow) after 8px of scroll.
- `.tz-header--overlay` makes it transparent over a full-bleed hero; with the inset hero card of the home page, use the default.

## Responsive
- Phone (base): 68px, logo + menu button. 640px: + CTA. 1024px: 84px, full nav, no menu button. 1180px: + phone chip.
- The drawer: links at 26px Bricolage with arrows, then **Offerte aanvragen** and **Bel 0469 41 37 30** full width.

## Svelte
`Header.svelte`: `current: 'home' | 'diensten' | 'realisaties' | 'contact'`, `phone` (from `settings`), `quoteHref`. Close the drawer in `afterNavigate`.

## Avoid
- More than five links. Service pages live under **Diensten**.
- Hiding the CTA on phones inside the drawer only: the hero and the contact section repeat it.
