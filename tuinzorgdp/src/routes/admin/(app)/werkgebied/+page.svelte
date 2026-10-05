<script lang="ts">
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { LIMITS } from '$lib/rules';

	let { data, form } = $props();
	let dialog: HTMLDialogElement | undefined = $state();
</script>

<svelte:head><title>Werkgebied | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>Werkgebied</h1>
	<button class="tz-btn tz-btn--sm" type="button" onclick={() => dialog?.showModal()}
		><Icon name="plus" /> Nieuwe gemeente</button
	>
</div>
{#if form?.message}<div class="tz-alert tz-alert--danger" role="alert">
		<Icon name="circle-x" />
		<div class="tz-alert__text">{form.message}</div>
	</div>{/if}
<p class="adm-muted">
	Elke gemeente krijgt een eigen pagina op tuinzorgdp.be/tuinonderhoud. Die verschijnt pas met een
	intro van minstens {LIMITS.areaIntroWords} woorden. Sleep om de volgorde te wijzigen.
</p>
<SortableList items={data.items} base="/admin/werkgebied" empty="Nog geen gemeenten." />

<dialog class="adm-dialog" bind:this={dialog} aria-labelledby="new-title">
	<form method="post" action="?/create">
		<h2 class="t-h4" id="new-title">Nieuwe gemeente</h2>
		<div class="tz-field">
			<label class="tz-label" for="n-name">Naam</label><input
				class="tz-input"
				id="n-name"
				name="name"
				required
				placeholder="Bijvoorbeeld: Lier"
			/>
		</div>
		<div class="adm-actions">
			<button type="button" class="tz-btn tz-btn--ghost" onclick={() => dialog?.close()}
				>Annuleren</button
			>
			<button type="submit" class="tz-btn">Aanmaken</button>
		</div>
	</form>
</dialog>
