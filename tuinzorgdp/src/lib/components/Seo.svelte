<script lang="ts">
	import { page } from '$app/state';
	import { jsonLd } from '$lib/schema-org';

	let {
		title,
		description,
		image = null,
		noindex = false,
		schema = []
	}: {
		title: string;
		description: string;
		image?: string | null;
		noindex?: boolean;
		schema?: Record<string, unknown>[];
	} = $props();

	const site = $derived(
		page.data.site as { url: string; testSite: boolean; analyticsToken: string | null }
	);
	const canonical = $derived(
		`${site.url}${page.url.pathname === '/' ? '/' : page.url.pathname.replace(/\/$/, '')}`
	);
	const ogImage = $derived(
		image
			? image.startsWith('http')
				? image
				: `${site.url}${image}`
			: `${site.url}/logo/tz-mark.svg`
	);
	// Built here (not in the markup) so the closing tag is never parsed as the end of this block.
	const ldTags = $derived(
		schema.map((item) => '<script type="application/ld+json">' + jsonLd(item) + '</' + 'script>')
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex || site.testSite}<meta name="robots" content="noindex, nofollow" />{/if}
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="nl_BE" />
	<meta property="og:site_name" content="TuinZorg DP" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	{#each ldTags as tag, i (i)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- serialised by jsonLd, which escapes < -->
		{@html tag}
	{/each}
</svelte:head>
