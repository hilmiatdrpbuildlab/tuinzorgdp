<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
</script>

<Seo
	title={data.page.title}
	description={data.page.description}
	noindex={data.page.noindex}
	schema={data.schema}
/>

<article class="tz-section">
	<div class="tz-container tz-stack">
		<span class="tz-eyebrow tz-eyebrow--pill app-self-start"
			><span class="tz-leaf"></span>Privacy</span
		>
		<h1 class="t-h1">{data.page.heading}</h1>
		{#if data.page.intro}<p class="t-lead">{data.page.intro}</p>{/if}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Markdown rendered and sanitised at build time -->
		<div class="app-prose">{@html data.page.bodyHtml}</div>
	</div>
</article>
