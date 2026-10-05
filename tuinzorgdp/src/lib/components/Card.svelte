<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		size = 'md',
		class: className = '',
		head,
		foot,
		children
	}: {
		variant?: 'default' | 'raised' | 'tint' | 'interactive';
		size?: 'md' | 'lg';
		class?: string;
		head?: Snippet;
		foot?: Snippet;
		children: Snippet;
	} = $props();
</script>

<div
	class={[
		'tz-card',
		variant !== 'default' && `tz-card--${variant}`,
		size === 'lg' && 'tz-card--lg',
		className
	]}
>
	{#if head}<div class="tz-card__head">{@render head()}</div>{/if}
	{@render children()}
	{#if foot}<div class="tz-card__foot">{@render foot()}</div>{/if}
</div>
