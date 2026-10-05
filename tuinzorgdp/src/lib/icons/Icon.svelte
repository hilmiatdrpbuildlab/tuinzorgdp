<script lang="ts">
	import { icons, type IconName } from './icons';

	let { name, class: className = '' }: { name: IconName; class?: string } = $props();

	const icon = $derived(icons[name]);
</script>

<svg
	class={['tz-icon', className]}
	xmlns="http://www.w3.org/2000/svg"
	viewBox={icon.viewBox}
	fill={icon.filled ? 'currentColor' : 'none'}
	stroke={icon.filled ? undefined : 'currentColor'}
	stroke-width={icon.filled ? undefined : 2}
	stroke-linecap={icon.filled ? undefined : 'round'}
	stroke-linejoin={icon.filled ? undefined : 'round'}
	aria-hidden="true"
	focusable="false"
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- generated from the design system's SVG files -->
	{@html icon.body}
</svg>
