<script lang="ts">
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Diensten | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>Diensten</h1>
	<form method="post" action="?/create">
		<button class="tz-btn tz-btn--sm" type="submit"><Icon name="plus" /> Nieuwe dienst</button>
	</form>
</div>
<p class="adm-muted">
	De uitgelichte dienst staat bovenaan, de rest in deze volgorde. Sleep om de volgorde te wijzigen.
</p>
<SortableList items={data.items} base="/admin/diensten" />
