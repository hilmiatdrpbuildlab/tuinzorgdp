# MediaSlot

The image frame used everywhere: a fixed aspect ratio, `object-fit: cover`, rounded corners, and a labelled empty state that tells the client which photo goes here.

## Use
- `.tz-media` with a ratio class: `--21x9`, `--16x9`, `--3x2`, `--4x3`, `--1x1`, `--4x5`, `--3x4`, `--2x3`, or `--free` (natural height). `--lg` rounds to `radius-lg`; `--square` removes the radius.
- Filled: one `<img>` (or `<picture>`) inside, with `width`, `height`, `alt`, `loading="lazy"` and `object-position` from the media focal point.
- Empty: `.tz-media__empty` with `{{icon:image-plus}}`, `.tz-media__ratio` (e.g. 4:3) and `.tz-media__field` (the CMS field, e.g. `services.cover_image_id`).

## Ratios per slot
- Hero: full bleed. Service card 4:3, featured 16:9. Gallery: 3:4, 4:5, 1:1, 4:3, 2:3 mixed. About collage 3:4 + 4:5. Social 1:1. Contact van photo 16:9. Map 16:9.

## Svelte
`MediaSlot.svelte`: `media?: {key, width, height, alt, focalX, focalY}`, `ratio`, `field`, `sizes`, `priority?`. Builds `src` and `srcset` from `PUBLIC_MEDIA_BASE_URL` and the stored widths.

## Avoid
- Stretching or letterboxing photos.
- Stock photos to fill an empty slot: the empty state is the honest placeholder.
