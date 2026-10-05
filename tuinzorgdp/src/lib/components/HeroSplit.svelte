<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Media } from '$lib/content/types';
	import { SIZES } from '$lib/media';
	import AccentTitle from './AccentTitle.svelte';
	import MediaSlot from './MediaSlot.svelte';

	/** The split hero for service, project and werkgebied pages: copy on Light, photos at 3:4 and 4:3. */
	let {
		eyebrow,
		title,
		accentWord,
		lead,
		photos = [],
		actions
	}: {
		eyebrow?: string;
		title: string;
		accentWord?: string | null;
		lead?: string | null;
		photos?: (Media | null)[];
		actions?: Snippet;
	} = $props();

	const shown = $derived(photos.filter((m): m is Media => !!m).slice(0, 3));
</script>

<div class="tz-section">
	<div class="tz-container">
		<section class="tz-hero tz-hero--split" aria-labelledby="hero-title">
			<div class="tz-hero__grid">
				<div class="tz-hero__copy">
					{#if eyebrow}<span class="tz-eyebrow tz-eyebrow--pill"
							><span class="tz-leaf"></span>{eyebrow}</span
						>{/if}
					<AccentTitle
						{title}
						{accentWord}
						level={1}
						id="hero-title"
						class="t-display app-display-split"
					/>
					{#if lead}<p class="t-lead">{lead}</p>{/if}
					{#if actions}<div class="tz-hero__actions">{@render actions()}</div>{/if}
				</div>
				{#if shown.length}
					<div class="tz-hero__photos">
						{#each shown as m, i (m.id)}
							<MediaSlot
								media={m}
								ratio={i === 0 ? '3x4' : '4x3'}
								lg
								sizes={SIZES.third}
								priority={i === 0}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</section>
	</div>
</div>
