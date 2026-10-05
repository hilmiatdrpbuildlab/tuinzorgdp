<script lang="ts">
	import type { Review, SiteSettings } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { formatScore } from '$lib/format';
	import { LIMITS } from '$lib/rules';
	import ReviewCard from './ReviewCard.svelte';
	import SectionHeader from './SectionHeader.svelte';
	import Stars from './Stars.svelte';

	let { google, reviews }: { google: SiteSettings['google']; reviews: Review[] } = $props();

	const shown = $derived(reviews.slice(0, LIMITS.homeReviews));
	const hasScore = $derived(typeof google.rating === 'number' && google.rating > 0);
</script>

<div>
	<SectionHeader
		eyebrow="Ervaringen"
		title="Wat klanten zeggen"
		accentWord="zeggen"
		id="rev-title"
	/>
	<div class="tz-reviews">
		{#if hasScore}
			<aside class="tz-review-summary">
				<span class="tz-review-summary__src"><Icon name="google" /> Google-reviews</span>
				<div class="tz-review-summary__score">
					<span class="t-stat">{formatScore(google.rating!)}</span>
					<div>
						<Stars
							rating={google.rating}
							lg
							label={`Gemiddelde score ${formatScore(google.rating!)} op 5`}
						/>
						{#if google.ratingCount}
							<div class="t-small app-ink-soft">Op basis van {google.ratingCount} reviews</div>
						{/if}
					</div>
				</div>
				{#if google.writeReviewUrl}
					<a class="tz-btn tz-btn--block" href={google.writeReviewUrl} rel="noopener noreferrer"
						>Schrijf een review <Icon name="external-link" /></a
					>
				{/if}
				{#if google.profileUrl}
					<a class="tz-textlink" href={google.profileUrl} rel="noopener noreferrer"
						>Alle reviews op Google <Icon name="arrow-right" /></a
					>
				{/if}
			</aside>
		{/if}
		{#if shown.length}
			<div class="tz-review-list">
				{#each shown as review (review.id)}<ReviewCard {review} />{/each}
			</div>
		{/if}
	</div>
</div>
