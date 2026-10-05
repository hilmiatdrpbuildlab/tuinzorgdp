<script lang="ts">
	import type { GalleryPhoto } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { SIZES, mediaSrc, srcset, variantWidths } from '$lib/media';

	let {
		photos,
		id,
		projectLinks = false
	}: { photos: GalleryPhoto[]; id: string; projectLinks?: boolean } = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let index = $state(0);
	let opener: HTMLElement | null = null;

	const current = $derived(photos[index]);
	const large = $derived.by(() => {
		if (!current) return '';
		const widths = variantWidths(current.media.width);
		return mediaSrc(current.media, widths.find((w) => w >= 1600) ?? widths[widths.length - 1]);
	});

	export function open(i: number, from: HTMLElement) {
		if (!dialog || i < 0) return;
		index = i;
		opener = from;
		dialog.showModal();
	}

	function step(n: number) {
		if (!photos.length) return;
		index = (index + n + photos.length) % photos.length;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') step(1);
		if (e.key === 'ArrowLeft') step(-1);
	}
</script>

<!-- Native <dialog>: Escape closes it, focus returns to the photo that opened it. -->
<dialog
	class="tz-lightbox"
	{id}
	aria-label="Foto"
	bind:this={dialog}
	onkeydown={onKeydown}
	onclick={(e) => e.target === dialog && dialog?.close()}
	onclose={() => opener?.focus()}
>
	{#if current}
		<img
			class="tz-lightbox__img"
			src={large}
			srcset={srcset(current.media)}
			sizes={SIZES.lightbox}
			alt={current.media.alt}
			width={current.media.width}
			height={current.media.height}
		/>
		<div class="tz-lightbox__bar">
			<div class="tz-lightbox__cap">
				<strong>{current.media.alt || current.title}</strong><span>{current.category}</span>
				{#if projectLinks}<a class="tz-lightbox__link" href="/realisaties/{current.projectSlug}"
						>{current.title}</a
					>{/if}
			</div>
			<div class="tz-lightbox__nav">
				<button
					class="tz-btn tz-btn--light tz-btn--icon tz-btn--sm"
					type="button"
					aria-label="Vorige foto"
					onclick={() => step(-1)}><Icon name="chevron-left" /></button
				>
				<button
					class="tz-btn tz-btn--light tz-btn--icon tz-btn--sm"
					type="button"
					aria-label="Volgende foto"
					onclick={() => step(1)}><Icon name="chevron-right" /></button
				>
				<form method="dialog">
					<button class="tz-btn tz-btn--light tz-btn--icon tz-btn--sm" aria-label="Sluiten"
						><Icon name="x" /></button
					>
				</form>
			</div>
		</div>
	{/if}
</dialog>
