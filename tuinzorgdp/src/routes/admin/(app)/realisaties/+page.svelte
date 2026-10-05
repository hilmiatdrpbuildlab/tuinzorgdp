<script lang="ts">
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data, form } = $props();
	let dialog: HTMLDialogElement | undefined = $state();
</script>

<svelte:head><title>Realisaties | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>Realisaties</h1>
	<button class="tz-btn tz-btn--sm" type="button" onclick={() => dialog?.showModal()}
		><Icon name="plus" /> Nieuwe realisatie</button
	>
</div>
{#if form?.message}<div class="tz-alert tz-alert--danger" role="alert">
		<Icon name="circle-x" />
		<div class="tz-alert__text">{form.message}</div>
	</div>{/if}
<p class="adm-muted">
	Een realisatie verschijnt pas op de website met een omslagfoto, minstens één foto in de galerij en
	alt-tekst bij elke foto. Sleep om de volgorde te wijzigen.
</p>
<SortableList items={data.items} base="/admin/realisaties" empty="Nog geen realisaties." />

<dialog class="adm-dialog" bind:this={dialog} aria-labelledby="new-title">
	<form method="post" action="?/create">
		<h2 class="t-h4" id="new-title">Nieuwe realisatie</h2>
		<div class="tz-field">
			<label class="tz-label" for="n-title">Titel</label><input
				class="tz-input"
				id="n-title"
				name="title"
				required
				placeholder="Bijvoorbeeld: Beukenhaag gesnoeid in Lier"
			/>
		</div>
		<div class="tz-field">
			<label class="tz-label" for="n-svc">Dienst</label>
			<div class="tz-select-wrap">
				<select class="tz-select" id="n-svc" name="service_id" required>
					{#each data.services as s (s.id)}<option value={s.id}>{s.title}</option>{/each}
				</select><Icon name="chevron-down" />
			</div>
		</div>
		<div class="adm-actions">
			<button type="button" class="tz-btn tz-btn--ghost" onclick={() => dialog?.close()}
				>Annuleren</button
			>
			<button type="submit" class="tz-btn">Aanmaken</button>
		</div>
	</form>
</dialog>
