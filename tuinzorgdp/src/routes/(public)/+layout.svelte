<script lang="ts">
	import { page } from '$app/state';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';

	let { data, children } = $props();

	const current = $derived.by(() => {
		const id = page.route.id ?? '';
		if (id === '/(public)') return 'home';
		if (id.startsWith('/(public)/diensten')) return 'diensten';
		if (id.startsWith('/(public)/realisaties')) return 'realisaties';
		if (id.startsWith('/(public)/contact')) return 'contact';
		return null;
	});
	const quoteHref = $derived(
		current === 'home' || current === 'contact' ? '#offerte' : '/contact#offerte'
	);
	const beacon = $derived(
		data.site.analyticsToken ? JSON.stringify({ token: data.site.analyticsToken }) : null
	);
</script>

<svelte:head>
	{#if beacon}
		<script
			defer
			src="https://static.cloudflareinsights.com/beacon.min.js"
			data-cf-beacon={beacon}
		></script>
	{/if}
</svelte:head>

<a class="tz-sr" href="#main">Naar de inhoud</a>
<Header {current} phone={data.settings.company.phone} {quoteHref} />
<main id="main">
	{@render children()}
</main>
<Footer
	settings={data.settings}
	services={data.footer.services}
	areas={data.footer.areas}
	{quoteHref}
/>
