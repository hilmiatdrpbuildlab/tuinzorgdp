# ContactSection

The lead-generation block: copy and tappable contact lines on the left, a form card with a segmented switch between **Offerte aanvragen** and **Algemene vraag** on the right.

## Use
- Markup in `components/_partials/contact.html`. The aside is sticky from 1024px.
- Quote form fields, in order: service tiles (multi-select, at least one), first and last name, phone and e-mail, garden address, postcode (4 digits) and municipality, timing and garden size (optional), photos (optional), message (600 characters with count), consent. Submit: **Offerte aanvragen** with the `send` chip and the line "Gratis en zonder verplichting".
- General form: name, e-mail, phone (optional), question. Submit: **Bericht versturen**.
- On success the form is hidden and `[data-tz-success]` takes focus.

## Conversion rules
- Ask only what the quote needs; everything else is **(optioneel)**.
- Service tiles first: one tap tells the visitor the form is about their garden.
- Phone, e-mail and WhatsApp stay one tap away beside the form.

## Svelte
`ContactSection.svelte` holds `QuoteForm.svelte` and `ContactForm.svelte` in tabs. Both post to SvelteKit actions (`?/offerte`, `?/vraag`) with `use:enhance`; the server returns `{ errors: Record<field, string> }` in the same Dutch wording.

## Avoid
- Placeholder text as the only label.
- A CAPTCHA; use a honeypot and timing check.
