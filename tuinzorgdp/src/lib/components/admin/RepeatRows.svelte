<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	/** Repeatable text rows (checklist, USPs) submitted as several fields with the same name. */
	let {
		label,
		name,
		rows = $bindable([]),
		max = 6,
		placeholder = '',
		hint
	}: {
		label: string;
		name: string;
		rows?: string[];
		max?: number;
		placeholder?: string;
		hint?: string;
	} = $props();

	function move(i: number, d: number) {
		const j = i + d;
		if (j < 0 || j >= rows.length) return;
		[rows[i], rows[j]] = [rows[j], rows[i]];
	}
</script>

<fieldset class="adm-repeat">
	<legend class="tz-label"
		>{label} <span class="adm-muted">({rows.length} van max. {max})</span></legend
	>
	{#if hint}<p class="tz-hint">{hint}</p>{/if}
	{#each rows as _, i (i)}
		<div class="adm-repeat__row">
			<input
				class="tz-input"
				{name}
				bind:value={rows[i]}
				{placeholder}
				aria-label="{label} {i + 1}"
			/>
			<button
				type="button"
				class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
				aria-label="Omhoog"
				onclick={() => move(i, -1)}
				disabled={i === 0}><Icon name="chevron-left" class="adm-rot90" /></button
			>
			<button
				type="button"
				class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
				aria-label="Omlaag"
				onclick={() => move(i, 1)}
				disabled={i === rows.length - 1}><Icon name="chevron-right" class="adm-rot90" /></button
			>
			<button
				type="button"
				class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
				aria-label="Verwijderen"
				onclick={() => rows.splice(i, 1)}><Icon name="trash-2" /></button
			>
		</div>
	{/each}
	{#if rows.length < max}
		<button type="button" class="tz-btn tz-btn--outline tz-btn--sm" onclick={() => rows.push('')}
			><Icon name="plus" /> Regel toevoegen</button
		>
	{/if}
</fieldset>
