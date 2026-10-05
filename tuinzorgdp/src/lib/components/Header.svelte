<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import Icon from '$lib/icons/Icon.svelte';
	import { shortPhone, telHref } from '$lib/format';

	let {
		current = null,
		phone,
		quoteHref = '/contact#offerte'
	}: {
		current?: 'home' | 'diensten' | 'realisaties' | 'contact' | null;
		phone?: string;
		quoteHref?: string;
	} = $props();

	const links = [
		{ key: 'home', href: '/', label: 'Home' },
		{ key: 'diensten', href: '/diensten', label: 'Diensten' },
		{ key: 'realisaties', href: '/realisaties', label: 'Realisaties' },
		{ key: 'contact', href: '/contact', label: 'Contact' }
	] as const;

	let open = $state(false);
	let scrolled = $state(false);
	let menuButton: HTMLButtonElement | undefined = $state();

	afterNavigate(() => (open = false));

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
			menuButton?.focus();
		}
	}
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 8)} onkeydown={onKeydown} />

<header class={['tz-header', scrolled && 'is-scrolled']} data-open={open ? '' : undefined}>
	<div class="tz-container">
		<div class="tz-header__bar">
			<a class="tz-header__logo" href="/" aria-label="TuinZorg DP, naar de homepage"
				><img src="/logo/tz-logo.svg" alt="TuinZorg DP" width="193" height="44" /></a
			>
			<nav class="tz-nav" aria-label="Hoofdmenu">
				{#each links as l (l.key)}
					<a href={l.href} aria-current={current === l.key ? 'page' : undefined}>{l.label}</a>
				{/each}
			</nav>
			<div class="tz-header__actions">
				{#if phone}
					<a class="tz-header__phone" href={telHref(phone)}
						><span class="tz-icon-chip"><Icon name="phone" /></span>{shortPhone(phone)}</a
					>
				{/if}
				<a class="tz-btn tz-btn--sm tz-header__cta" href={quoteHref}>Offerte aanvragen</a>
				<button
					class="tz-menu-btn"
					type="button"
					bind:this={menuButton}
					aria-expanded={open}
					aria-label={open ? 'Menu sluiten' : 'Menu openen'}
					onclick={() => (open = !open)}
					><Icon name="menu" class="tz-icon--open" /><Icon
						name="x"
						class="tz-icon--close"
					/></button
				>
			</div>
		</div>
	</div>
	<div class="tz-drawer">
		<div class="tz-container">
			<nav aria-label="Hoofdmenu, mobiel">
				{#each links as l (l.key)}
					<a href={l.href} aria-current={current === l.key ? 'page' : undefined}
						>{l.label} <Icon name="arrow-right" /></a
					>
				{/each}
			</nav>
			<div class="tz-drawer__actions">
				<a class="tz-btn tz-btn--block" href={quoteHref}>Offerte aanvragen</a>
				{#if phone}
					<a class="tz-btn tz-btn--outline tz-btn--block" href={telHref(phone)}
						><Icon name="phone" /> Bel {shortPhone(phone)}</a
					>
				{/if}
			</div>
		</div>
	</div>
</header>
