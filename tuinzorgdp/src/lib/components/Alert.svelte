<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let {
		tone = 'info',
		title,
		dismissible = false,
		children
	}: {
		tone?: 'info' | 'success' | 'warning' | 'danger';
		title: string;
		dismissible?: boolean;
		children?: Snippet;
	} = $props();

	let open = $state(true);
	const icon = $derived(
		(
			{
				info: 'info',
				success: 'circle-check',
				warning: 'triangle-alert',
				danger: 'circle-x'
			} as const
		)[tone]
	);
</script>

{#if open}
	<div
		class={['tz-alert', tone !== 'info' && `tz-alert--${tone}`]}
		role={tone === 'danger' ? 'alert' : 'status'}
	>
		<Icon name={icon} />
		<div>
			<div class="tz-alert__title">{title}</div>
			{#if children}<div class="tz-alert__text">{@render children()}</div>{/if}
		</div>
		{#if dismissible}
			<button
				class="tz-alert__close"
				type="button"
				aria-label="Sluiten"
				onclick={() => (open = false)}><Icon name="x" /></button
			>
		{/if}
	</div>
{/if}
