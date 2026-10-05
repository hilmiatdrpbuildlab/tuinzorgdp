# SectionHeader

The opening of every section: a leaf eyebrow pill, a `t-h1` with one accent word, an optional lead and an optional action on the right.

## Use
- `.tz-section-head` > `.tz-section-head__text` (eyebrow, title, lead) + optional `.tz-section-head__aside` (one outline button or text link).
- `.tz-section-head--center` for Forest sections and short sections.
- The eyebrow is `.tz-eyebrow.tz-eyebrow--pill` with `.tz-leaf`; plain `.tz-eyebrow` inside cards.

## Svelte
`SectionHeader.svelte`: `eyebrow`, `title`, `accentWord?`, `lead?`, `align: 'left' | 'center'`, slot `aside`. The component splits `title` around `accentWord` to wrap it.

## Avoid
- Two accent words, or an accent word in a title under 22px.
