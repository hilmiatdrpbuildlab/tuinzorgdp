<script lang="ts">
	import ContactSection from '$lib/components/ContactSection.svelte';
	import FaqSection from '$lib/components/FaqSection.svelte';
	import MapEmbed from '$lib/components/MapEmbed.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
</script>

<Seo title={data.page.title} description={data.page.description} schema={data.schema} />

<ContactSection
	settings={data.settings}
	tiles={data.tiles}
	photo={data.photo}
	areaLabel={data.areaLabel}
	title={data.page.heading}
	accentWord="gratis"
	lead={data.page.intro}
	turnstileSiteKey={data.site.turnstileSiteKey}
	level={1}
/>

{#if data.settings.mapsEmbedUrl}
	<section class="tz-section" style="padding-top: 0" aria-label="Kaart">
		<div class="tz-container"><MapEmbed src={data.settings.mapsEmbedUrl} /></div>
	</section>
{/if}

<FaqSection faqs={data.faqs} linkHref="#offerte" />
