# ProcessSteps

The werkwijze in four numbered steps on Forest, from the current site: Contact opnemen, Advies en bespreking, Uitvoering, Oplevering.

## Use
- `ol.tz-steps` > `li.tz-step` with `.tz-step__num` (counter, 01–04), an icon chip, a `t-h4` title and one sentence.
- Dashed connectors appear between the cards from 1024px.

## Svelte
`ProcessSteps.svelte`: `steps: {icon, title, text}[]` (fixed copy, no CMS table needed).

## Avoid
- More than five steps, or paragraphs in a step.
