<script lang="ts">
	import type { Review } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { formatDate, initial } from '$lib/format';
	import Stars from './Stars.svelte';

	let { review }: { review: Review } = $props();

	const meta = $derived([review.place, formatDate(review.reviewedOn)].filter(Boolean).join(' · '));
</script>

<article class="tz-review">
	<div class="tz-review__top">
		<Stars rating={review.rating} /><span class="tz-review__quote"><Icon name="quote" /></span>
	</div>
	<p class="tz-review__text">{review.quote}</p>
	<div class="tz-review__author">
		<span class="tz-avatar">{initial(review.author)}</span>
		<div>
			<div class="tz-review__name">{review.author}</div>
			{#if meta}<div class="tz-review__meta">{meta}</div>{/if}
		</div>
		{#if review.source === 'google'}
			{#if review.sourceUrl}
				<a
					class="tz-review__g"
					href={review.sourceUrl}
					rel="noopener noreferrer"
					aria-label="Review op Google"><Icon name="google" /></a
				>
			{:else}
				<span class="tz-review__g" title="Review op Google"><Icon name="google" /></span>
			{/if}
		{/if}
	</div>
</article>
