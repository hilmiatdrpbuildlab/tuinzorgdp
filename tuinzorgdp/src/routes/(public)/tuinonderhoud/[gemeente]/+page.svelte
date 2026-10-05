<script lang="ts">
	import ContactSection from '$lib/components/ContactSection.svelte';
	import HeroSplit from '$lib/components/HeroSplit.svelte';
	import ProjectGallery from '$lib/components/ProjectGallery.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ServiceGrid from '$lib/components/ServiceGrid.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data } = $props();
	const a = $derived(data.area);
</script>

<Seo title={data.page.title} description={data.page.description} schema={data.schema} />

<HeroSplit
	eyebrow="Werkgebied"
	title={data.page.heading}
	accentWord={a.name}
	photos={data.heroPhotos}
>
	{#snippet actions()}
		<a class="tz-btn" href="#offerte"
			>Offerte aanvragen <span class="tz-btn__chip"><Icon name="arrow-right" /></span></a
		>
	{/snippet}
</HeroSplit>

<section class="tz-section tz-bg-surface" aria-label={`Over tuinonderhoud in ${a.name}`}>
	<div class="tz-container">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Markdown rendered and sanitised at build time -->
		<div class="app-prose">{@html a.introHtml}</div>
	</div>
</section>

<section class="tz-section" aria-labelledby="diensten-title">
	<div class="tz-container">
		<SectionHeader
			eyebrow="Onze diensten"
			title={`Onze diensten in ${a.name}`}
			accentWord={a.name}
			id="diensten-title"
		/>
		<ServiceGrid services={data.services} />
	</div>
</section>

{#if data.gallery.length}
	<section class="tz-section tz-bg-surface" aria-labelledby="real-title">
		<div class="tz-container">
			<SectionHeader
				eyebrow="Realisaties"
				title={`Ons werk in ${a.name}`}
				accentWord={a.name}
				id="real-title"
			/>
			<ProjectGallery photos={data.gallery} id="gallery-area" />
		</div>
	</section>
{/if}

<ContactSection
	settings={data.settings}
	tiles={data.tiles}
	areaLabel={`${a.name} en omstreken`}
	turnstileSiteKey={data.site.turnstileSiteKey}
	presetMunicipality={a.name}
/>
