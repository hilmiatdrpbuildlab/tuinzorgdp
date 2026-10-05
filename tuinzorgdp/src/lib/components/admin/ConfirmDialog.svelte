<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/icons/Icon.svelte';

	/** Deleting always asks first, in a dialog that names the item. */
	let {
		item,
		action = '?/delete',
		label = 'Verwijderen',
		extra = '',
		fields = {}
	}: {
		item: string;
		action?: string;
		label?: string;
		extra?: string;
		fields?: Record<string, string>;
	} = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	const uid = $props.id();
</script>

<button type="button" class="tz-btn tz-btn--danger tz-btn--sm" onclick={() => dialog?.showModal()}
	><Icon name="trash-2" /> {label}</button
>

<dialog class="adm-dialog" bind:this={dialog} aria-labelledby="{uid}-title">
	<form
		method="post"
		{action}
		use:enhance={() =>
			async ({ update }) => {
				dialog?.close();
				await update();
			}}
	>
		{#each Object.entries(fields) as [k, v] (k)}<input type="hidden" name={k} value={v} />{/each}
		<h2 class="t-h4" id="{uid}-title">"{item}" verwijderen?</h2>
		<p>Dit kan niet ongedaan gemaakt worden.{extra ? ` ${extra}` : ''}</p>
		<div class="adm-actions">
			<button type="button" class="tz-btn tz-btn--ghost" onclick={() => dialog?.close()}
				>Annuleren</button
			>
			<button type="submit" class="tz-btn tz-btn--danger" data-confirm>Ja, verwijderen</button>
		</div>
	</form>
</dialog>
