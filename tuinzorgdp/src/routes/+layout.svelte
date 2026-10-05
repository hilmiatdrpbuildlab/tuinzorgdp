<script lang="ts">
	import '$lib/styles/tokens.css';
	import '$lib/styles/tz.css';
	import '$lib/app.css';
	import bricolage from '$lib/fonts/BricolageGrotesque-Variable.woff2?url';
	import figtree from '$lib/fonts/Figtree-Variable.woff2?url';

	import { onMount } from 'svelte';

	let { children } = $props();

	// Marks the page as interactive (used by the end-to-end tests to wait for hydration).
	onMount(() => (document.documentElement.dataset.ready = ''));
</script>

<svelte:head>
	<link rel="preload" href={bricolage} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={figtree} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

{@render children()}
