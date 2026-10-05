<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';

	type Props = {
		href?: string;
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'light' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		/** Trailing chip: the arrow when the button leads somewhere, `send` on submit. */
		arrow?: boolean | 'send';
		icon?: IconName;
		trailingIcon?: IconName;
		loading?: boolean;
		block?: boolean;
		iconOnly?: boolean;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'class' | 'children'>;

	let {
		href,
		variant = 'primary',
		size = 'md',
		arrow = false,
		icon,
		trailingIcon,
		loading = false,
		block = false,
		iconOnly = false,
		class: className = '',
		children,
		type = 'button',
		disabled,
		...rest
	}: Props = $props();

	const classes = $derived([
		'tz-btn',
		variant !== 'primary' && `tz-btn--${variant}`,
		size !== 'md' && `tz-btn--${size}`,
		block && 'tz-btn--block',
		iconOnly && 'tz-btn--icon',
		loading && 'is-loading',
		className
	]);
</script>

{#snippet content()}
	{#if loading}<Icon name="loader-circle" class="tz-spin" />{/if}
	{#if icon}<Icon name={icon} />{/if}
	{#if loading}<span class="tz-btn__label">{@render children?.()}</span
		>{:else}{@render children?.()}{/if}
	{#if trailingIcon}<Icon name={trailingIcon} />{/if}
	{#if arrow}<span class="tz-btn__chip"
			><Icon name={arrow === 'send' ? 'send' : 'arrow-right'} /></span
		>{/if}
{/snippet}

{#if href}
	<a class={classes} {href} aria-disabled={disabled ? 'true' : undefined} {...rest}
		>{@render content()}</a
	>
{:else}
	<button class={classes} {type} {disabled} aria-busy={loading ? 'true' : undefined} {...rest}
		>{@render content()}</button
	>
{/if}
