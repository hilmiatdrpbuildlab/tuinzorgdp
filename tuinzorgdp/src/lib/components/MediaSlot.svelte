<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Media } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { defaultSrc, objectPosition, srcset, type Ratio } from '$lib/media';

	let {
		media = null,
		ratio = '4x3',
		field = '',
		sizes = '100vw',
		priority = false,
		lg = false,
		as = 'div',
		decorative = false,
		emptyIcon = 'image-plus',
		emptyLabel,
		class: className = '',
		children
	}: {
		media?: Media | null;
		ratio?: Ratio;
		/** Shown in the empty state: the CMS field this slot is waiting for. */
		field?: string;
		sizes?: string;
		priority?: boolean;
		lg?: boolean;
		as?: 'div' | 'span';
		decorative?: boolean;
		emptyIcon?: 'image-plus' | 'map-pin';
		emptyLabel?: string;
		class?: string;
		children?: Snippet;
	} = $props();

	const label = $derived(emptyLabel ?? ratio.replace('x', ':'));
</script>

<svelte:element
	this={as}
	class={['tz-media', ratio !== 'free' && `tz-media--${ratio}`, lg && 'tz-media--lg', className]}
	style={as === 'span' ? 'display:block' : undefined}
>
	{#if media}
		<img
			src={defaultSrc(media)}
			srcset={srcset(media)}
			{sizes}
			width={media.width}
			height={media.height}
			alt={decorative ? '' : media.alt}
			loading={priority ? undefined : 'lazy'}
			decoding={priority ? undefined : 'async'}
			fetchpriority={priority ? 'high' : undefined}
			style:object-position={objectPosition(media)}
		/>
	{:else}
		<svelte:element this={as === 'span' ? 'span' : 'div'} class="tz-media__empty">
			<Icon name={emptyIcon} />
			<span class="tz-media__ratio">{label}</span>
			{#if field}<span class="tz-media__field">{field}</span>{/if}
		</svelte:element>
	{/if}
	{@render children?.()}
</svelte:element>
