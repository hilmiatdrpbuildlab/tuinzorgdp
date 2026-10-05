<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any -- each public page types its own data */
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import Home from '../../../(public)/+page.svelte';
	import Contact from '../../../(public)/contact/+page.svelte';
	import Diensten from '../../../(public)/diensten/+page.svelte';
	import Dienst from '../../../(public)/diensten/[slug]/+page.svelte';
	import Privacy from '../../../(public)/privacy/+page.svelte';
	import Realisaties from '../../../(public)/realisaties/+page.svelte';
	import Realisatie from '../../../(public)/realisaties/[slug]/+page.svelte';
	import Gemeente from '../../../(public)/tuinonderhoud/[gemeente]/+page.svelte';

	let { data } = $props();
	const d = $derived(data as any);
	const PAGES: Record<string, any> = {
		home: Home,
		diensten: Diensten,
		dienst: Dienst,
		realisaties: Realisaties,
		realisatie: Realisatie,
		gemeente: Gemeente,
		contact: Contact,
		privacy: Privacy
	};
	const Page = $derived(PAGES[data.kind]);
</script>

<div class="adm-preview-bar" role="status">
	Voorbeeld van {data.path} met alle opgeslagen wijzigingen, ook wat nog niet gepubliceerd is.
	<a href="/admin">Terug naar het beheer</a>
</div>
<Header phone={d.settings.company.phone} />
<main id="main">
	<Page data={d} />
</main>
<Footer settings={d.settings} services={d.footer.services} areas={d.footer.areas} />

<style>
	.adm-preview-bar {
		position: sticky;
		top: 0;
		z-index: 60;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		justify-content: center;
		padding: var(--space-xs) var(--space-md);
		background: var(--amber-300);
		color: var(--forest-950);
		font-weight: 600;
		font-size: 14px;
	}
	.adm-preview-bar a {
		color: inherit;
	}
</style>
