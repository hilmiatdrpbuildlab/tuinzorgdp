# ServiceCard

The CMS-driven service card: one `services` row becomes one card with a 4:3 photo, an overlapping icon chip, subtitle, title, summary and a **Meer info** row. The featured service is a wide Forest card.

## Use
- `.tz-services` is the grid; it takes any number of `article.tz-service`. The first featured service gets `.tz-service--featured`.
- The title link's `::after` makes the whole card clickable; there is no second link inside.
- No photo yet: the `MediaSlot` empty state shows the ratio and the field (`services.cover_image_id`).
- `.tz-service--compact` drops the photo for dense lists.

## States
- Hover: lift 3px, `shadow-md`, border `line-strong`, photo zooms 4%, arrow chip turns `accent` and tilts. Focus: the focus ring on the title link.

## Responsive
- Phone: 1 column. 640px: 2 columns, featured full width. 900px: featured photo and text side by side. 1100px: 3 columns, featured spans 3 (photo two thirds).

## Svelte
`ServiceCard.svelte`: `slug`, `title`, `subtitle`, `summary` (max 160 characters), `bullets: string[]` (featured only, max 3), `icon`, `cover?: Media`, `featured?`. `ServiceGrid.svelte` sorts featured first, then by `sort`.

## Avoid
- Summaries longer than three lines; the detail page has the full text.
- Mixing photo and compact cards in one grid.
