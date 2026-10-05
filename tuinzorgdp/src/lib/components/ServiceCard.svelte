<script lang="ts">
	import type { Service } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { SIZES } from '$lib/media';
	import MediaSlot from './MediaSlot.svelte';

	let {
		service,
		featured = false,
		level = 3
	}: { service: Service; featured?: boolean; level?: 2 | 3 } = $props();
</script>

<article class={['tz-service', featured && 'tz-service--featured']} data-service={service.slug}>
	<MediaSlot
		media={service.cover}
		ratio={featured ? '16x9' : '4x3'}
		sizes={featured ? SIZES.featured : SIZES.service}
		field="Foto volgt"
	/>
	<div class="tz-service__body">
		<span class="tz-icon-chip tz-icon-chip--solid tz-service__icon"
			><Icon name={service.icon} /></span
		>
		{#if service.subtitle}<span class="tz-service__sub">{service.subtitle}</span>{/if}
		<svelte:element this={`h${level}`} class="tz-service__title"
			><a href="/diensten/{service.slug}">{service.title}</a></svelte:element
		>
		<p class="tz-service__summary">{service.summary}</p>
		{#if featured && service.bullets.length}
			<ul class="tz-service__list">
				{#each service.bullets.slice(0, 3) as b (b)}<li><Icon name="check" />{b}</li>{/each}
			</ul>
		{/if}
		<div class="tz-service__foot">
			<span>Meer info</span><span class="tz-service__go" aria-hidden="true"
				><Icon name="arrow-right" /></span
			>
		</div>
	</div>
</article>
