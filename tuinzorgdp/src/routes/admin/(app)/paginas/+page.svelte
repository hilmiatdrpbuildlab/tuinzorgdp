<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Pagina's | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head"><h1>Pagina's</h1></div>
<p class="adm-muted">
	De vaste pagina's van de website. Diensten, realisaties en werkgebied hebben elk hun eigen scherm.
</p>
<ul class="adm-list">
	{#each data.pages as p (p.slug)}
		<li class="adm-row">
			<a class="adm-row__main" href="/admin/paginas/{p.slug}"
				><span class="adm-row__title">{p.label}</span><span class="adm-row__meta">{p.title}</span
				></a
			>
			<Icon name="chevron-right" />
		</li>
	{/each}
</ul>
