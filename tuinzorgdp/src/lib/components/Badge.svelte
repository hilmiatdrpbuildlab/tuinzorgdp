<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';

	let {
		variant = 'default',
		icon,
		dot = false,
		class: className = '',
		children
	}: {
		variant?:
			| 'default'
			| 'solid'
			| 'glass'
			| 'earth'
			| 'outline'
			| 'success'
			| 'warning'
			| 'danger'
			| 'info';
		icon?: IconName;
		dot?: boolean;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<span class={['tz-badge', variant !== 'default' && `tz-badge--${variant}`, className]}
	>{#if dot}<span class="tz-badge__dot"></span>{/if}{#if icon}<Icon
			name={icon}
		/>{/if}{@render children()}</span
>
