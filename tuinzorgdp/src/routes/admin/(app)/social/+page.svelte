<script lang="ts">
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { LIMITS } from '$lib/rules';

	let { data } = $props();
</script>

<svelte:head><title>Social | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>Social</h1>
	<form method="post" action="?/create">
		<button class="tz-btn tz-btn--sm" type="submit"><Icon name="plus" /> Nieuw bericht</button>
	</form>
</div>
<p class="adm-muted">
	De website toont de eerste {LIMITS.socialPosts} gepubliceerde berichten, elk met een foto en een link
	naar Instagram of Facebook. Sleep om de volgorde te wijzigen.
</p>
<SortableList items={data.items} base="/admin/social" empty="Nog geen berichten." />
