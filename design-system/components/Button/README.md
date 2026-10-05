# Button

Pill buttons in Figtree 650, sentence case: one leaf-green primary per view with the arrow chip, a forest secondary, outline, ghost and a light glass button for photos.

## Use
- `a.tz-btn` for navigation, `button.tz-btn` for actions. Put `<span class="tz-btn__chip">{{icon:arrow-right}}</span>` after the label when the button leads somewhere (on submit: `send`); the arrow slides 3px on hover.
- Variants: default (primary, `accent`), `.tz-btn--secondary` (forest fill), `.tz-btn--outline`, `.tz-btn--ghost`, `.tz-btn--light` (on photos and the hero only), `.tz-btn--danger` (CMS deletes only).
- Sizes: `.tz-btn--sm` (44px, header and follow buttons), default (52px), `.tz-btn--lg` (60px, hero, CTA band and form submit).
- `.tz-btn--icon` makes a round icon-only button; it needs a Dutch `aria-label` (**Vorige foto**, **Sluiten**).
- `.tz-btn--block` fills its container (drawer, phone forms).
- `.tz-textlink` for tertiary links: underlined in `highlight`, the underline turns `heading` on hover.

## States
- Hover: `accent-hover` (a deeper forest). Pressed: `accent-press`, 1px drop, 99% scale. Focus: 2px `focus` ring at 2px offset. Disabled: `disabled` (or `aria-disabled="true"` on a link), 45% opacity, no pointer.
- Loading: add `.is-loading` and `aria-busy="true"`, put `{{icon:loader-circle}}` with class `tz-spin` before the label and wrap the label in `.tz-btn__label`. Keep the width.

## Svelte
`Button.svelte`: `href?`, `variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'light'`, `size: 'sm' | 'md' | 'lg'`, `arrow?: boolean | 'send'`, `icon?` (leading), `loading?`, `disabled?`, `block?`, `type?`. Renders `<a>` when `href` is set, otherwise `<button>`.

## Copy
Dutch, two or three words, saying what happens: **Offerte aanvragen**, **Gratis offerte aanvragen**, **Bekijk ons werk**, **Alle realisaties**, **Bericht versturen**, **Schrijf een review**.

## Avoid
- Two primaries side by side. Pair the primary with an outline, light or text link.
- White text on `leaf-500` or `leaf-600` (2.8:1 and 3.9:1). The primary is `leaf-700`.
- Square corners: every button is a pill.
