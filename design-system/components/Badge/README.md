# Badge

Small labels and filter tags: pill-shaped, Figtree 700 uppercase, for categories on photos, status and counts.

## Use
- `.tz-badge` default (`tint`), `--solid`, `--glass` (on photos), `--earth`, `--outline`, and the status badges `--success`, `--warning`, `--danger`, `--info` with `.tz-badge__dot`.
- Filter tags: `.tz-tags` > `button.tz-tag[aria-pressed]` with an optional `.tz-tag__count`. `.tz-tags--scroll` keeps them in one swipeable row on phones.

## Svelte
`Badge.svelte`: `variant`, `icon?`, `dot?`. `FilterTags.svelte`: `options: {value, label, count}[]`, `bind:value`.

## Avoid
- Status by colour alone: every status badge has a word.
