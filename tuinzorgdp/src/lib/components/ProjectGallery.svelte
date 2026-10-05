<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import type { GalleryPhoto } from '$lib/content/types';
	import { galleryRatio } from '$lib/media';
	import GalleryShot from './GalleryShot.svelte';
	import Lightbox from './Lightbox.svelte';

	let {
		photos,
		id = 'gallery',
		limit,
		showFilter = true,
		/** On /realisaties the filter is kept in ?dienst= so a filtered view can be shared. */
		urlParam = false,
		/** The gallery page: larger photos (.tz-gallery--lg) and a link to each photo's realisatie. */
		large = false
	}: {
		photos: GalleryPhoto[];
		id?: string;
		limit?: number;
		showFilter?: boolean;
		urlParam?: boolean;
		large?: boolean;
	} = $props();

	const shown = $derived(limit ? photos.slice(0, limit) : photos);
	const filters = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a local value inside $derived
		const map = new Map<string, { value: string; label: string; count: number }>();
		for (const p of shown) {
			const f = map.get(p.serviceSlug) ?? { value: p.serviceSlug, label: p.category, count: 0 };
			f.count++;
			map.set(p.serviceSlug, f);
		}
		return [...map.values()];
	});

	let active = $state('');
	let lightbox: Lightbox | undefined = $state();

	const visible = $derived(shown.filter((p) => !active || p.serviceSlug === active));

	onMount(() => {
		if (!urlParam) return;
		const d = page.url.searchParams.get('dienst');
		if (d && filters.some((f) => f.value === d)) active = d;
	});

	function select(value: string) {
		active = value;
		if (urlParam) {
			const url = new URL(page.url);
			if (value) url.searchParams.set('dienst', value);
			else url.searchParams.delete('dienst');
			replaceState(url, {});
		}
	}
</script>

{#if showFilter && filters.length > 1}
	<div class="tz-gallery-tools">
		<div class="tz-tags tz-tags--scroll" role="group" aria-label="Filter op dienst">
			<button class="tz-tag" type="button" aria-pressed={active === ''} onclick={() => select('')}
				>Alles <span class="tz-tag__count">{shown.length}</span></button
			>
			{#each filters as f (f.value)}
				<button
					class="tz-tag"
					type="button"
					aria-pressed={active === f.value}
					onclick={() => select(f.value)}
					>{f.label} <span class="tz-tag__count">{f.count}</span></button
				>
			{/each}
		</div>
	</div>
{/if}

<div class={['tz-gallery', large && 'tz-gallery--lg']} {id}>
	{#each shown as photo, i (photo.media.id + photo.projectSlug)}
		<GalleryShot
			{photo}
			ratio={galleryRatio(photo.media.width, photo.media.height, i)}
			hidden={!!active && photo.serviceSlug !== active}
			{large}
			onopen={(el) => lightbox?.open(visible.indexOf(photo), el)}
		/>
	{/each}
</div>

<Lightbox bind:this={lightbox} photos={visible} id={`${id}-lightbox`} projectLinks={large} />
