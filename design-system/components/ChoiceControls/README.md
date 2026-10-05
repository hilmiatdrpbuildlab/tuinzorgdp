# ChoiceControls

Checkboxes, radios, the service tiles of the quote form and the segmented switch between the two forms.

## Use
- `label.tz-check` > `input[type=checkbox|radio]` + text. 24px boxes, `accent` fill when checked.
- Service tiles: `.tz-tiles` (2 / 3 / 4 columns) > `label.tz-tile` > hidden checkbox + service icon + `.tz-tile__name` + `.tz-tile__box`. Multi-select; put `data-tz-group` on the `.tz-field` to require at least one.
- Segmented switch: `.tz-segment[data-tz-tabs][role=tablist]` with `role="tab"` buttons controlling `role="tabpanel"` panels; arrow keys move.

## Svelte
`ServiceTiles.svelte`: `services: {slug, title, icon}[]`, `bind:group`. `Segment.svelte`: `options`, `bind:value`. Native inputs underneath, so forms submit without JavaScript.

## Avoid
- Custom controls without a native input.
- Tiles for single choices: use radios.
