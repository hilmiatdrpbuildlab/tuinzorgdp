<script lang="ts">
	import type { GalleryPhoto } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { SIZES, type Ratio } from '$lib/media';
	import MediaSlot from './MediaSlot.svelte';

	let {
		photo,
		ratio,
		hidden = false,
		large = false,
		onopen
	}: {
		photo: GalleryPhoto;
		ratio: Ratio;
		hidden?: boolean;
		large?: boolean;
		onopen: (el: HTMLElement) => void;
	} = $props();
</script>

<button
	class="tz-shot"
	type="button"
	{hidden}
	data-cat={photo.category}
	aria-label={`Foto vergroten: ${photo.media.alt || photo.title}`}
	onclick={(e) => onopen(e.currentTarget)}
>
	<span class="tz-badge tz-badge--glass tz-shot__badge">{photo.category}</span>
	<MediaSlot
		media={photo.media}
		{ratio}
		as="span"
		sizes={large ? SIZES.galleryLarge : SIZES.gallery}
	/>
	<span class="tz-shot__cap"
		><span>{photo.media.alt || photo.title}</span><span class="tz-icon-chip"
			><Icon name="maximize-2" /></span
		></span
	>
</button>
