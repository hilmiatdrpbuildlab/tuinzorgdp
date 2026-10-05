# Alert

Inline messages for page-level states: success after sending, a warning, an error, or an info tip. Always an icon, a title and a sentence.

## Use
- `.tz-alert` (info) or `--success`, `--warning`, `--danger` > icon > text (`.tz-alert__title`, `.tz-alert__text`) > optional `.tz-alert__close[data-tz-dismiss]`.
- Errors explain what went wrong and what to do: "Uw aanvraag is niet verstuurd. Controleer uw internetverbinding en probeer opnieuw, of bel 0469 41 37 30."

## Svelte
`Alert.svelte`: `tone`, `title`, `dismissible?`, default slot. `role="status"` for success and info, `role="alert"` for errors.

## Avoid
- Field errors only in an alert: put them at the field.
