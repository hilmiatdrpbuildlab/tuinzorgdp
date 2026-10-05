<script lang="ts">
	import CTABand from '$lib/components/CTABand.svelte';
	import HeroSplit from '$lib/components/HeroSplit.svelte';
	import MediaSlot from '$lib/components/MediaSlot.svelte';
	import ProjectGallery from '$lib/components/ProjectGallery.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { formatDate } from '$lib/format';
	import { SIZES } from '$lib/media';

	let { data } = $props();
	const p = $derived(data.project);
	const lead = $derived(
		[
			p.summary,
			p.completedOn
				? `Uitgevoerd in ${formatDate(p.completedOn).split(' ').slice(1).join(' ')}.`
				: null
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<Seo
	title={data.page.title}
	description={data.page.description}
	image={data.page.image}
	schema={data.schema}
/>

<HeroSplit
	eyebrow={p.service.shortLabel}
	title={p.title}
	{lead}
	photos={[p.cover, ...p.photos.map((x) => x.media)].filter(
		(m, i, all) => m && all.findIndex((y) => y?.id === m.id) === i
	)}
>
	{#snippet actions()}
		<a class="tz-btn" href="/contact#offerte"
			>Offerte aanvragen <span class="tz-btn__chip"><Icon name="arrow-right" /></span></a
		>
		<a class="tz-btn tz-btn--outline" href="/diensten/{p.service.slug}"
			>Over {p.service.title.toLowerCase()}</a
		>
	{/snippet}
</HeroSplit>

{#if data.pair}
	<section class="tz-section tz-bg-surface" aria-labelledby="pair-title">
		<div class="tz-container tz-stack">
			<h2 class="t-h2" id="pair-title">Voor en na</h2>
			<div class="app-pair">
				<figure>
					<MediaSlot media={data.pair.before} ratio="3x4" lg sizes={SIZES.half} />
					<figcaption>Voor</figcaption>
				</figure>
				<figure>
					<MediaSlot media={data.pair.after} ratio="3x4" lg sizes={SIZES.half} />
					<figcaption>Na</figcaption>
				</figure>
			</div>
		</div>
	</section>
{/if}

<section class="tz-section" aria-labelledby="photos-title">
	<div class="tz-container tz-stack">
		<h2 class="t-h2" id="photos-title">Foto's</h2>
		<ProjectGallery photos={data.gallery} id="gallery-project" showFilter={false} />
		{#if p.bodyHtml}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- Markdown rendered and sanitised at build time -->
			<div class="app-prose">{@html p.bodyHtml}</div>
		{/if}
		{#if p.area}
			<p>
				<a class="tz-textlink" href="/tuinonderhoud/{p.area.slug}"
					>Tuinonderhoud in {p.area.name} <Icon name="arrow-right" /></a
				>
			</p>
		{/if}
	</div>
</section>

{#if data.related.length}
	<section class="tz-section tz-bg-surface" aria-labelledby="related-title">
		<div class="tz-container tz-stack">
			<h2 class="t-h2" id="related-title">Meer realisaties</h2>
			<div class="app-cards">
				{#each data.related as r (r.slug)}
					<article class="tz-card tz-card--interactive">
						<MediaSlot media={r.cover} ratio="4x3" sizes={SIZES.third} />
						<span class="tz-badge">{r.service}</span>
						<h3 class="t-h4">
							<a class="tz-card__link" href="/realisaties/{r.slug}">{r.title}</a>
						</h3>
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
