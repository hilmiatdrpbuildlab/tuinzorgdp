<script lang="ts">
	import CTABand from '$lib/components/CTABand.svelte';
	import MediaSlot from '$lib/components/MediaSlot.svelte';
	import ProjectGallery from '$lib/components/ProjectGallery.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { SIZES } from '$lib/media';

	let { data } = $props();
</script>

<Seo title={data.page.title} description={data.page.description} schema={data.schema} />

<section class="tz-section" aria-labelledby="real-title">
	<div class="tz-container">
		<SectionHeader
			eyebrow="Realisaties"
			title={data.page.heading}
			accentWord="uw buurt"
			lead={data.page.intro}
			level={1}
			id="real-title"
		/>
		{#if data.gallery.length}
			<p class="app-ink-soft app-gallery-count">
				{data.gallery.length} foto's van {data.projects.length}
				{data.projects.length === 1 ? 'realisatie' : 'realisaties'}. Klik op een foto om ze groot te
				bekijken.
			</p>
			<ProjectGallery photos={data.gallery} id="gallery-all" urlParam large />
		{:else}
			<p class="t-lead">Binnenkort ziet u hier onze realisaties.</p>
		{/if}
	</div>
</section>

{#if data.projects.length}
	<section class="tz-section tz-bg-surface" aria-labelledby="projects-title">
		<div class="tz-container tz-stack">
			<h2 class="t-h2" id="projects-title">Bekijk per project</h2>
			<div class="app-cards">
				{#each data.projects as p (p.slug)}
					<article class="tz-card tz-card--interactive">
						<MediaSlot media={p.cover} ratio="4x3" sizes={SIZES.service} />
						<span class="tz-badge">{p.service}</span>
						<h3 class="t-h4">
							<a class="tz-card__link" href="/realisaties/{p.slug}">{p.title}</a>
						</h3>
						{#if p.summary}<p class="t-small app-ink-soft">{p.summary}</p>{/if}
						<div class="tz-card__foot">
							<span class="t-small">{p.area ?? 'Bekijk project'}</span><Icon name="arrow-right" />
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>
{/if}

<section class="tz-section">
	<div class="tz-container">
		<CTABand
			title={data.cta.title}
			accentWord={data.cta.accentWord}
			lead={data.cta.lead}
			phone={data.settings.company.phone}
			quoteHref="/contact#offerte"
		/>
	</div>
</section>
