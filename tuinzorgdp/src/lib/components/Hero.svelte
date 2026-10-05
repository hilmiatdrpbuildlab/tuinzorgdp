<script lang="ts">
	import type { Media } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';
	import { formatScore, shortPhone, telHref } from '$lib/format';
	import { SIZES } from '$lib/media';
	import AccentTitle from './AccentTitle.svelte';
	import MediaSlot from './MediaSlot.svelte';
	import Stars from './Stars.svelte';

	const USP_ICONS: IconName[] = ['badge-check', 'sprout', 'handshake'];

	let {
		title,
		accentWord,
		lead,
		image = null,
		rating = null,
		usps = [],
		phone,
		quoteHref = '#offerte',
		workHref = '#realisaties'
	}: {
		title: string;
		accentWord?: string | null;
		lead: string;
		image?: Media | null;
		rating?: { score: number; href: string } | null;
		usps?: string[];
		phone?: string;
		quoteHref?: string;
		workHref?: string;
	} = $props();
</script>

<div class="tz-hero-wrap">
	<section class="tz-hero" data-theme="forest" aria-labelledby="hero-title">
		<MediaSlot
			media={image}
			ratio="free"
			class="tz-hero__media"
			sizes={SIZES.hero}
			priority
			decorative
			field="pages.hero_media_id"
		/>
		<div class="tz-container tz-hero__grid">
			<div class="tz-hero__copy">
				{#if rating}
					<a class="tz-hero__rating" href={rating.href}
						><span class="tz-g"><Icon name="google" /></span><Stars
							rating={rating.score}
							label={`${formatScore(rating.score)} op 5 sterren`}
						/><span>{formatScore(rating.score)} op Google</span></a
					>
				{/if}
				<AccentTitle {title} {accentWord} level={1} id="hero-title" class="t-display" />
				<p class="t-lead">{lead}</p>
				<div class="tz-hero__actions">
					<a class="tz-btn tz-btn--lg" href={quoteHref}
						>Gratis offerte aanvragen <span class="tz-btn__chip"><Icon name="arrow-right" /></span
						></a
					>
					<a class="tz-btn tz-btn--lg tz-btn--light" href={workHref}>Bekijk ons werk</a>
				</div>
			</div>
			<aside class="tz-hero__card" aria-label="Snel contact">
				<span class="tz-eyebrow app-eyebrow-lime"
					><span class="tz-leaf"></span>Gratis en vrijblijvend</span
				>
				<h2>Vraag vandaag nog uw offerte aan</h2>
				<ul>
					<li><Icon name="check" /> Persoonlijk advies over uw tuin</li>
					<li><Icon name="check" /> Eerlijke prijzen, duidelijke afspraken</li>
					<li><Icon name="check" /> Nette afwerking, alles opgeruimd</li>
				</ul>
				{#if phone}<a class="tz-btn" href={telHref(phone)}
						><Icon name="phone" /> {shortPhone(phone)}</a
					>{/if}
			</aside>
			{#if usps.length}
				<ul class="tz-hero__usps" role="list">
					{#each usps as usp, i (usp)}
						<li class="tz-hero__usp">
							<span class="tz-icon-chip"><Icon name={USP_ICONS[i % 3]} /></span>{usp}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>
</div>
