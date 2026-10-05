<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Icon from '$lib/icons/Icon.svelte';

	type Props = {
		label: string;
		name: string;
		id: string;
		as?: 'input' | 'textarea' | 'select';
		value?: string;
		required?: boolean;
		optional?: boolean;
		hint?: string;
		error?: string | null;
		success?: string | null;
		options?: string[];
		placeholderOption?: string;
		maxlength?: number;
		count?: boolean;
		class?: string;
	} & Omit<HTMLInputAttributes, 'value' | 'class' | 'id' | 'name'>;

	let {
		label,
		name,
		id,
		as = 'input',
		value = $bindable(''),
		required = false,
		optional = false,
		hint,
		error = null,
		success = null,
		options = [],
		placeholderOption = 'Maak een keuze',
		maxlength,
		count = false,
		class: className = '',
		...rest
	}: Props = $props();

	const describedBy = $derived(
		[error ? `${id}-err` : null, hint ? `${id}-hint` : null, count ? `${id}-count` : null]
			.filter(Boolean)
			.join(' ') || undefined
	);
</script>

<div class={['tz-field', error && 'tz-field--error', success && 'tz-field--success', className]}>
	<label class="tz-label" for={id}
		>{label}
		{#if required}<span class="tz-label__req" aria-hidden="true">*</span>{/if}
		{#if optional}<span class="tz-label__opt">(optioneel)</span>{/if}</label
	>
	{#if as === 'textarea'}
		<textarea
			class="tz-textarea"
			{id}
			{name}
			{required}
			{maxlength}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			placeholder={rest.placeholder as string | undefined}></textarea>
		{#if count && maxlength}<span class="tz-count" id="{id}-count"
				>{value.length} / {maxlength}</span
			>{/if}
	{:else if as === 'select'}
		<div class="tz-select-wrap">
			<select
				class="tz-select"
				{id}
				{name}
				{required}
				bind:value
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={describedBy}
			>
				<option value="">{placeholderOption}</option>
				{#each options as o (o)}<option>{o}</option>{/each}
			</select>
			<Icon name="chevron-down" />
		</div>
	{:else}
		<input
			class="tz-input"
			{id}
			{name}
			{required}
			{maxlength}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			{...rest}
		/>
	{/if}
	{#if hint}<span class="tz-hint" id="{id}-hint">{hint}</span>{/if}
	{#if error}<span class="tz-msg tz-msg--error" id="{id}-err"><Icon name="circle-x" /> {error}</span
		>{/if}
	{#if success}<span class="tz-msg tz-msg--success"><Icon name="check" /> {success}</span>{/if}
</div>
