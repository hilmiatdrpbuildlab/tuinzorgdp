<script lang="ts">
	import type { Snippet } from 'svelte';
	import AccentTitle from './AccentTitle.svelte';

	let {
		eyebrow,
		title,
		accentWord,
		lead,
		align = 'left',
		level = 2,
		id,
		titleClass = 't-h1',
		aside
	}: {
		eyebrow?: string;
		title: string;
		accentWord?: string | null;
		lead?: string | null;
		align?: 'left' | 'center';
		level?: 1 | 2;
		id?: string;
		titleClass?: string;
		aside?: Snippet;
	} = $props();
</script>

<div class={['tz-section-head', align === 'center' && 'tz-section-head--center']}>
	<div class="tz-section-head__text">
		{#if eyebrow}<span class="tz-eyebrow tz-eyebrow--pill"
				><span class="tz-leaf"></span>{eyebrow}</span
			>{/if}
		<AccentTitle {title} {accentWord} {level} {id} class={titleClass} />
		{#if lead}<p class="t-lead">{lead}</p>{/if}
	</div>
	{#if aside}<div class="tz-section-head__aside">{@render aside()}</div>{/if}
</div>
