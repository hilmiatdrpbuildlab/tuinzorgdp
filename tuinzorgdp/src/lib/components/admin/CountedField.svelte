<script lang="ts">
	/** A text field that counts characters left against a limit (62 / 158 / 160) or words towards a minimum. */
	import { wordCount } from '$lib/rules';

	let {
		label,
		name,
		value = $bindable(''),
		max,
		minWords,
		as = 'input',
		rows = 4,
		required = false,
		hint,
		error,
		id = `f-${name}`,
		placeholder
	}: {
		label: string;
		name: string;
		value?: string | null;
		max?: number;
		minWords?: number;
		as?: 'input' | 'textarea';
		rows?: number;
		required?: boolean;
		hint?: string;
		error?: string | null;
		id?: string;
		placeholder?: string;
	} = $props();

	const length = $derived((value ?? '').length);
	const words = $derived(wordCount(value ?? ''));
	const over = $derived(max !== undefined && length > max);
	const short = $derived(minWords !== undefined && words < minWords);
</script>

<div class={['tz-field', (error || over) && 'tz-field--error']}>
	<label class="tz-label" for={id}
		>{label}{#if required}&nbsp;<span class="tz-label__req" aria-hidden="true">*</span>{/if}</label
	>
	{#if as === 'textarea'}
		<textarea
			class="tz-textarea"
			{id}
			{name}
			{rows}
			{required}
			{placeholder}
			bind:value
			aria-describedby="{id}-count"></textarea>
	{:else}
		<input
			class="tz-input"
			{id}
			{name}
			{required}
			{placeholder}
			bind:value
			aria-describedby="{id}-count"
		/>
	{/if}
	<span class="adm-count" id="{id}-count" class:adm-count--bad={over || short} aria-live="polite">
		{#if max !== undefined}{over
				? `${length - max} tekens te veel`
				: `${max - length} tekens over`}{/if}
		{#if minWords !== undefined}{words} woorden{short
				? `, minstens ${minWords} om te publiceren`
				: ''}{/if}
	</span>
	{#if hint}<span class="tz-hint">{hint}</span>{/if}
	{#if error}<span class="tz-msg tz-msg--error">{error}</span>{/if}
</div>
