<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import HeroSplit from '$lib/components/HeroSplit.svelte';
	import ProjectGallery from '$lib/components/ProjectGallery.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data } = $props();
	const s = $derived(data.service);
</script>

<Seo
	title={data.page.title}
	description={data.page.description}
	image={data.page.image}
	schema={data.schema}
/>

<HeroSplit
	eyebrow={s.shortLabel}
	title={s.title}
	lead={s.subtitle ? `${s.subtitle}. ${s.summary}` : s.summary}
	photos={data.heroPhotos}
>
	{#snippet actions()}
		<a class="tz-btn" href="#offerte"
			>Offerte aanvragen <span class="tz-btn__chip"><Icon name="arrow-right" /></span></a
		>
		{#if data.gallery.length}<a class="tz-btn tz-btn--outline" href="#realisaties"
				>Bekijk realisaties</a
			>{/if}
	{/snippet}
</HeroSplit>

<section class="tz-section tz-bg-surface" aria-labelledby="wat-title">
	<div class="tz-container app-split">
		<div class="tz-stack">
			<h2 class="t-h2" id="wat-title">Wat wij doen</h2>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- Markdown rendered and sanitised at build time -->
			<div class="app-prose">{@html s.bodyHtml}</div>
		</div>
		{#if s.bullets.length}
			<div class="tz-card tz-card--tint">
				<h3 class="t-h4">In het kort</h3>
				<ul class="app-checklist">
					{#each s.bullets as b (b)}<li><Icon name="check" />{b}</li>{/each}
				</ul>
			</div>
		{/if}
	</div>
</section>

{#if data.gallery.length}
	<section class="tz-section" id="realisaties" aria-labelledby="real-title">
		<div class="tz-container">
			<SectionHeader
				eyebrow="Realisaties"
				title={`${s.title}: ons werk`}
				accentWord="ons werk"
				id="real-title"
			/>
			<ProjectGallery photos={data.gallery} id="gallery-service" showFilter={false} />
		</div>
	</section>
{/if}

{#if data.faqs.length}
	<section class="tz-section tz-bg-surface" aria-labelledby="faq-title">
		<div class="tz-container tz-faq">
			<div class="tz-stack">
				<h2 class="t-h2" id="faq-title">Vragen over {s.title.toLowerCase()}</h2>
			</div>
			<Accordion items={data.faqs} open={0} />
		</div>
	</section>
{/if}

<ContactSection
	settings={data.settings}
	tiles={data.tiles}
	areaLabel={data.areaLabel}
	turnstileSiteKey={data.site.turnstileSiteKey}
	presetService={s.slug}
/>
