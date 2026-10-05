# CSS and Tailwind

Both are generated from `tokens.json` by `python src/build.py`, so they never drift from the tokens. Use one of them, not both side by side with different values.

## CSS variables
`css/tokens.css` holds the font faces, every token as a custom property on `:root`, the theme overrides for `[data-theme="forest"]` and `[data-theme="sand"]`, and one class per type style. Load it first, then `css/tz.css` for the components. In SvelteKit import both in `src/app.css` and keep component styles in `tz.css` (global) so the class names in this system stay the contract; scoped `<style>` blocks are for layout tweaks only.

```html
<link rel="preload" href="/fonts/BricolageGrotesque-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/tz.css">
<body class="tz">
  <section data-theme="forest">…</section>
</body>
```

```css
{{TOKENS_CSS}}
```

The display width is set by `css/tz.css`, because the width axis is not part of the token grammar:

```css
.t-display, .t-h1, .t-h2, .t-h3, .t-h4, .t-stat { font-variation-settings: "wdth" 92; text-wrap: balance; }
```

## Tailwind CSS
`tailwind.config.js` maps every token to its CSS variable, so the themes keep working: `bg-surface text-ink`, `bg-accent text-on-accent hover:bg-accent-hover`, `border-line-strong`, `text-ink-soft`, `p-lg gap-md`, `rounded-md`, `rounded-full`, `shadow-md`, `font-display text-h1 display-width`, `bg-overlay`. Load `tokens.css` before the Tailwind output. For Tailwind v4, load it with `@config "./tailwind.config.js";`.

```js
{{TAILWIND}}
```

Example, the primary button in Svelte with Tailwind:

```svelte
<a href="/offerte" class="group inline-flex items-center gap-xs h-control pl-[26px] pr-[7px] rounded-full bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-press active:translate-y-px font-sans text-button transition-colors duration-fast ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
  Offerte aanvragen
  <span class="grid place-items-center size-[38px] rounded-full bg-white/15">
    <ArrowRight class="size-[18px] transition-transform duration-base group-hover:translate-x-[3px]" aria-hidden="true" />
  </span>
</a>
```
