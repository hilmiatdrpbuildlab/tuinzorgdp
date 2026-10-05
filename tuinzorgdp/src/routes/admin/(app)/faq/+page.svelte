<script lang="ts">
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data } = $props();
</script>

<svelte:head><title>FAQ | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>FAQ</h1>
	<form method="post" action="?/create">
		<button class="tz-btn tz-btn--sm" type="submit"><Icon name="plus" /> Nieuwe vraag</button>
	</form>
</div>
<p class="adm-muted">
	Vragen bij een dienst staan op die dienstpagina, algemene vragen op de FAQ-pagina. Sleep om de
	volgorde te wijzigen.
</p>
<SortableList items={data.items} base="/admin/faq" empty="Nog geen vragen." />
