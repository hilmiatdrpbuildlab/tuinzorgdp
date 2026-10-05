# Hero

The first screen: an inset rounded photo card in Forest with the display headline, the Google score, two buttons, a glass quote card and three USPs. A split variant puts the photos beside the text on Light.

## Use
- Markup in `components/_partials/hero.html`. Wrap in `.tz-hero-wrap` (the 8–12px inset). The photo is a `MediaSlot` with `.tz-hero__media`; the `overlay` token darkens the left half.
- Headline: `t-display`, one accent word in `.tz-accent-word` (lime on Forest). Lead in `mist-200`, max 50ch.
- Buttons: large primary **Gratis offerte aanvragen** with the arrow chip, and **Bekijk ons werk** as `.tz-btn--light`.
- The Google score chip only shows when `review_summary` has a score. The quote card (`.tz-hero__card`) shows from 1024px.
- `.tz-hero--split`: copy on Light, two photos at 3:4 and 4:3 on the right. Use it for service and landing pages.

## Responsive
- Phone: min height 88svh, headline 44px, buttons wrap, USPs stacked, quote card hidden. Tablet: USPs in three columns. Desktop: copy and quote card side by side.

## Svelte
`Hero.svelte`: `title`, `accentWord`, `lead`, `image: Media`, `rating?: {score, total, url}`, `usps: {icon, label}[]`, `variant: 'card' | 'split'`. The image is the only eager, `fetchpriority="high"` image on the page.

## Avoid
- A photo where the subject sits behind the headline: choose photos with calm left halves (lawn, hedge, sky).
- More than one `t-display` per page.
