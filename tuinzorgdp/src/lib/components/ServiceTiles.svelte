<script lang="ts" module>
	import type { IconName } from '$lib/icons/icons';

	export type Tile = { value: string; label: string; icon: IconName };
</script>

<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	let {
		tiles,
		group = $bindable([]),
		name = 'diensten',
		error = null,
		legend = 'Waarmee kunnen wij u helpen?'
	}: {
		tiles: Tile[];
		group?: string[];
		name?: string;
		error?: string | null;
		legend?: string;
	} = $props();
</script>

<div class={['tz-field', error && 'tz-field--error']}>
	<fieldset class="tz-form__group" aria-describedby={error ? `${name}-err` : undefined}>
		<legend>{legend} <span class="tz-label__req" aria-hidden="true">*</span></legend>
		<div class="tz-tiles tz-tiles--4">
			{#each tiles as t (t.value)}
				<label class="tz-tile"
					><input
						type="checkbox"
						{name}
						value={t.value}
						bind:group
						aria-invalid={error ? 'true' : undefined}
					/><Icon name={t.icon} /><span class="tz-tile__name">{t.label}</span><span
						class="tz-tile__box"
					></span></label
				>
			{/each}
		</div>
	</fieldset>
	{#if error}<span class="tz-msg tz-msg--error" id="{name}-err"
			><Icon name="circle-x" /> {error}</span
		>{/if}
</div>
