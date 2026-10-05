<script lang="ts">
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Reviews | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>Reviews</h1>
	<form method="post" action="?/create">
		<button class="tz-btn tz-btn--sm" type="submit"><Icon name="plus" /> Nieuwe review</button>
	</form>
</div>
<p class="adm-muted">
	Een review verschijnt pas op de website als de klant toestemming gaf. Sleep om de volgorde te
	wijzigen.
</p>
<SortableList items={data.items} base="/admin/reviews" empty="Nog geen reviews." />
