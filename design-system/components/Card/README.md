# Card

The generic container: a `surface` panel with a hairline border and `radius-md`, for text blocks, perks, info panels and anything that needs its own edge.

## Use
- `.tz-card` > optional `.tz-card__head`, content, optional `.tz-card__foot`. Padding `space-lg`; `.tz-card--lg` uses `space-xl` and `radius-lg`.
- `--raised`: `shadow-md`, no border. Only for a card floating over a photo or a sticky panel.
- `--tint`: `tint` fill and no border, for highlighted info.
- `--interactive`: the whole card is one link (`a.tz-card__link` on the title).
- Icon chips (`.tz-icon-chip`, `--solid`) lead cards and list items.

## Svelte
`Card.svelte`: `variant: 'default' | 'raised' | 'tint'`, `size`, `href?`, slots `head`, default, `foot`.

## Avoid
- Cards inside cards.
- Coloured stripes down one side.
