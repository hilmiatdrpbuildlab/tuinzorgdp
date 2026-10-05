# SocialFeed

The latest Instagram and Facebook posts as square tiles, with follow buttons for Instagram, Facebook and WhatsApp.

## Use
- Markup in `components/_partials/social-block.html`. Six tiles, each a link to the post, with the network mark top right and the caption on hover.
- Data from `social_posts` (Graph API, cached); without a token, hide the grid and keep the follow buttons.

## Responsive
- 2 columns on phones, 3 from 768px, 6 from 1024px.

## Svelte
`SocialFeed.svelte`: `posts: {network, permalink, media, caption}[]`, `links: {instagram?, facebook?, whatsapp}`.

## Avoid
- Embedding the platforms' own widgets: they load trackers and break the layout.
