# ReviewCard

Google reviews: a summary card with the live score, count and **Schrijf een review**, and review cards with stars, text, avatar, name, date and the Google mark.

## Use
- Markup in `components/_partials/review-block.html`, on the Sand theme.
- Only real Google reviews from `reviews_cache` (Places API, refreshed nightly). Show what Google shows; do not filter or edit. Link every card and the summary to the Google profile.
- Text clamps at six lines. Avatar: the reviewer's Google photo, or their initial.
- The amber placeholders mark where live data goes; if there are no reviews yet, hide the section.

## Responsive
- Phone: summary, then a swipe row of cards with snap (86% wide, the next one peeks). 768px: two cards per view. 1024px: summary 340px + grid of 2, 3 at 1240px.

## Svelte
`GoogleReviews.svelte`: `summary: {score, total, url, writeUrl}`, `reviews: Review[]` (max 6). `ReviewCard.svelte`: `author`, `photo?`, `rating`, `text`, `relativeTime`, `url`. Stars use `role="img"` with an `aria-label` ("5 op 5 sterren").

## Avoid
- Hand-written or invented reviews and testimonials.
- A carousel that moves by itself.
