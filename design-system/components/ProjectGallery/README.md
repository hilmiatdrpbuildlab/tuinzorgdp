# ProjectGallery

The completed-projects masonry: filter tags with counts, photos in mixed ratios with a category badge and a hover caption, and a lightbox with previous and next.

## Use
- Markup in `components/_partials/gallery.html`. `[data-tz-filter="<gallery id>"]` holds `.tz-tag` buttons (`value` = category, empty for all); `[data-tz-gallery="<dialog id>"]` on the gallery opens the lightbox.
- Each tile is a `button.tz-shot` with `data-cat`, `data-title` and `data-full` (the large image URL). Inside: badge, `MediaSlot` with a ratio class, caption.
- Ratios: use the photo's own ratio snapped to `3x4`, `4x5`, `1x1`, `4x3` or `2x3`. Mixing them is what makes the masonry staggered; never force every tile to the same ratio.
- Masonry is CSS columns: reading order runs down each column. The filter and the lightbox use DOM order, so keep the newest first.

- `.tz-gallery--lg` for the gallery page (`/realisaties`): larger photos, 2 columns from 768px and 3 from 1100px. In the lightbox, `.tz-lightbox__link` leads to the realisatie the photo belongs to.

## Responsive
- 2 columns and 12px gaps on phones, 3 from 768px, 4 from 1100px with 24px gaps. Captions are always visible on touch screens and appear on hover with a mouse.

## Svelte
`ProjectGallery.svelte`: `photos: {media, title, category, ratio}[]`, `filters`, `limit`, `moreHref`. `GalleryShot.svelte` and `Lightbox.svelte` (native `<dialog>`, arrow keys, Escape, focus returns to the tile). Use `?dienst=` in the URL on `/realisaties` so a filtered view can be shared.

## Avoid
- Photos without alt text.
- Autoplaying sliders: the gallery is browsed, not watched.
