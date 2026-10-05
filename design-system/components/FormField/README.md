# FormField

Text inputs, selects, textareas, unit inputs and the photo drop zone, each with a label above, an optional hint, and inline error or success messages.

## Use
- `.tz-field` > `label.tz-label` (+ `.tz-label__req` or `.tz-label__opt`) > control > optional `.tz-hint` > `.tz-msg--error` / `.tz-msg--success` (hidden until the field state class is set).
- Controls: `.tz-input`, `.tz-select` inside `.tz-select-wrap` with `chevron-down`, `.tz-textarea` (with `data-tz-count` for a live count), `.tz-input-group` + `.tz-input-group__addon` (m²), `label.tz-drop` with a file input.
- Rows: `.tz-form__row` (2 columns from 640px), `.tz-form__row--3` (1 : 2, postcode and municipality).
- Use the right `type`, `inputmode` and `autocomplete` on every field: `tel`, `email`, `postal-code`, `address-level2`.

## States
- Default, hover (`heading` border), focus (`accent` border, halo, focus ring), error (`.tz-field--error`, `aria-invalid`, message with `circle-x`), success (`.tz-field--success`), disabled, read-only.

## Svelte
`FormField.svelte`: `label`, `name`, `type`, `required?`, `optional?`, `hint?`, `error?`, `value` (bindable), plus pass-through attributes. The error id is wired with `aria-describedby`.

## Avoid
- Placeholders as labels; the placeholder only shows a format (0470 12 34 56).
- Red before the visitor has submitted.
