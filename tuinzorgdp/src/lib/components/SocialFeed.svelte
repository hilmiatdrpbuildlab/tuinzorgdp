<script lang="ts">
	import type { SocialPost } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { whatsappHref } from '$lib/format';
	import { SIZES } from '$lib/media';
	import MediaSlot from './MediaSlot.svelte';

	let {
		posts,
		links
	}: {
		posts: SocialPost[];
		links: { instagram?: string; facebook?: string; whatsapp?: string };
	} = $props();

	const NETWORK = { instagram: 'Instagram', facebook: 'Facebook' } as const;
</script>

<div class="tz-social">
	<div class="tz-social__head">
		<div class="tz-stack app-gap-xs">
			<span class="tz-eyebrow"><span class="tz-leaf"></span>Volg ons werk</span>
			<h3 class="t-h3">Elke week nieuwe tuinen</h3>
		</div>
		<div class="tz-social__follow">
			{#if links.instagram}<a
					class="tz-btn tz-btn--outline tz-btn--sm"
					href={links.instagram}
					rel="noopener noreferrer"><Icon name="instagram" /> Instagram</a
				>{/if}
			{#if links.facebook}<a
					class="tz-btn tz-btn--outline tz-btn--sm"
					href={links.facebook}
					rel="noopener noreferrer"><Icon name="facebook" /> Facebook</a
				>{/if}
			{#if links.whatsapp}<a
					class="tz-btn tz-btn--outline tz-btn--sm"
					href={whatsappHref(links.whatsapp)}
					rel="noopener noreferrer"><Icon name="whatsapp" /> WhatsApp</a
				>{/if}
		</div>
	</div>
	<div class="tz-social__grid">
		{#each posts as post (post.id)}
			<a
				class="tz-post"
				href={post.url}
				rel="noopener noreferrer"
				aria-label={`${post.caption ?? 'Bericht'}, bekijk op ${NETWORK[post.network]}`}
			>
				<MediaSlot media={post.media} ratio="1x1" as="span" sizes={SIZES.social} decorative />
				<span class="tz-post__net"><Icon name={post.network} /></span>
				{#if post.caption}<span class="tz-post__over">{post.caption}</span>{/if}
			</a>
		{/each}
	</div>
</div>
