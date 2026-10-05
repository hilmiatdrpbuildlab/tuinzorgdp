# Toast

A short confirmation that floats bottom-right (full width on phones) and closes itself after five seconds or on click.

## Use
- `.tz-toasts` (fixed region, `aria-live="polite"`) > `.tz-toast` > icon > `.tz-toast__text` > optional close button.
- For completed actions only: "Link gekopieerd", "Bericht verstuurd". The form success panel stays the main confirmation.

## Svelte
`Toast.svelte` with a small store: `toast.show(text, {icon})`.

## Avoid
- Errors in a toast; they need to stay on screen.
