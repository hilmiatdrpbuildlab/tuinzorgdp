# Accordion

FAQ items as native `<details>`: a 64px question row with a round plus chip that turns into a green cross when open.

## Use
- `.tz-accordion` > `details` > `summary` (question + `.tz-icon-chip` with `plus`) + `.tz-accordion__body`.
- Open the first item by default when it answers the most-asked question (the service area).
- Emit the same questions as `FAQPage` JSON-LD.

## Svelte
`Accordion.svelte`: `items: {question, answer}[]`, `open?: number`. Native `details` keeps it working without JavaScript.

## Avoid
- Answers longer than a short paragraph; link to a page instead.
