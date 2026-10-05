<script lang="ts">
	import AboutSplit from '$lib/components/AboutSplit.svelte';
	import CTABand from '$lib/components/CTABand.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import FaqSection from '$lib/components/FaqSection.svelte';
	import GoogleReviews from '$lib/components/GoogleReviews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import ProcessSteps from '$lib/components/ProcessSteps.svelte';
	import ProjectGallery from '$lib/components/ProjectGallery.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ServiceGrid from '$lib/components/ServiceGrid.svelte';
	import SocialFeed from '$lib/components/SocialFeed.svelte';

	let { data } = $props();

	const s = $derived(data.settings);
	const hasRating = $derived(typeof s.google.rating === 'number' && s.google.rating > 0);
	const showReviews = $derived(hasRating || data.reviews.length > 0);
	const showSocial = $derived(data.social.length > 0);
</script>

<Seo
	title={data.page.title}
	description={data.page.description}
	image={null}
	schema={data.schema}
/>

<Hero
	title={data.home.hero.title}
	accentWord={data.home.hero.accentWord}
	lead={data.home.hero.lead}
	image={data.heroImage}
	usps={data.home.hero.usps}
	workHref={data.gallery.length ? '#realisaties' : '/realisaties'}
	phone={s.company.phone}
	rating={hasRating
		? {
				score: s.google.rating!,
				href: showReviews ? '#reviews' : (s.google.profileUrl ?? '#reviews')
			}
		: null}
/>

<AboutSplit
	eyebrow={data.home.about.eyebrow}
	title={data.home.about.title}
	accentWord={data.home.about.accentWord}
	lead={data.home.about.lead}
	perks={data.home.about.perks}
	photos={data.home.aboutMedia}
/>

<section class="tz-section tz-bg-surface" id="diensten" aria-labelledby="diensten-title">
	<div class="tz-container">
		<SectionHeader
			eyebrow="Onze diensten"
			title="Alles voor een verzorgde tuin"
			accentWord="verzorgde"
			lead="Van een eenmalige onderhoudsbeurt tot periodiek tuinonderhoud. Kies wat u nodig heeft, of laat ons alles uit handen nemen."
			id="diensten-title"
		>
			{#snippet aside()}
				<a class="tz-btn tz-btn--outline" href="/diensten"
					>Alle diensten <span class="tz-btn__chip"><Icon name="arrow-right" /></span></a
				>
			{/snippet}
		</SectionHeader>
		<ServiceGrid services={data.services} />
	</div>
</section>

{#if data.gallery.length}
	<section class="tz-section" id="realisaties" aria-labelledby="real-title">
		<div class="tz-container">
			<SectionHeader
				eyebrow="Realisaties"
				title="Ons werk in uw buurt"
				accentWord="uw buurt"
				lead="Echte tuinen, echte resultaten. Elke foto is een opdracht van TuinZorg DP."
				id="real-title"
			/>
			<ProjectGallery photos={data.gallery} id="gallery-home" />
			<div class="tz-gallery__more">
				<a class="tz-btn tz-btn--secondary" href="/realisaties"
					>Alle realisaties <span class="tz-btn__chip"><Icon name="arrow-right" /></span></a
				>
			</div>
		</div>
	</section>
{/if}

<section class="tz-section" style="padding-top: 0">
	<div class="tz-container">
		<CTABand
			title={data.home.cta.title}
			accentWord={data.home.cta.accentWord}
			lead={data.home.cta.lead}
			phone={s.company.phone}
		/>
	</div>
</section>

<ProcessSteps />

{#if showReviews || showSocial}
	<section
		class="tz-section"
		data-theme="sand"
		id="reviews"
		aria-labelledby={showReviews ? 'rev-title' : undefined}
		aria-label={showReviews ? undefined : 'Volg ons werk'}
	>
		<div class="tz-container tz-stack" style="gap: var(--space-4xl)">
			{#if showReviews}<GoogleReviews google={s.google} reviews={data.reviews} />{/if}
			{#if showSocial}
				<SocialFeed
					posts={data.social}
					links={{
						instagram: s.socials.instagram,
						facebook: s.socials.facebook,
						whatsapp: s.company.whatsapp
					}}
				/>
			{/if}
		</div>
	</section>
{/if}

<FaqSection faqs={data.faqs} />

<ContactSection
	settings={s}
	tiles={data.tiles}
	photo={data.contactMedia}
	areaLabel={data.areaLabel}
	turnstileSiteKey={data.site.turnstileSiteKey}
/>
