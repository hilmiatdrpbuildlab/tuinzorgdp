<script lang="ts">
	import '$lib/components/admin/admin.css';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import PublishBanner from '$lib/components/admin/PublishBanner.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';

	let { data, children } = $props();

	const NAV: ({ href: string; label: string; icon: IconName } | null)[] = [
		{ href: '/admin', label: 'Overzicht', icon: 'leaf' },
		{ href: '/admin/aanvragen', label: 'Aanvragen', icon: 'mail' },
		null,
		{ href: '/admin/paginas', label: "Pagina's", icon: 'layers' },
		{ href: '/admin/diensten', label: 'Diensten', icon: 'mower' },
		{ href: '/admin/realisaties', label: 'Realisaties', icon: 'image' },
		{ href: '/admin/reviews', label: 'Reviews', icon: 'star' },
		{ href: '/admin/google', label: 'Google', icon: 'google' },
		{ href: '/admin/faq', label: 'FAQ', icon: 'message-circle' },
		{ href: '/admin/werkgebied', label: 'Werkgebied', icon: 'map-pin' },
		{ href: '/admin/social', label: 'Social', icon: 'instagram' },
		null,
		{ href: '/admin/media', label: 'Media', icon: 'image-plus' },
		{ href: '/admin/seo', label: 'SEO & redirects', icon: 'arrow-up-right' },
		{ href: '/admin/instellingen', label: 'Instellingen', icon: 'pencil' },
		{ href: '/admin/account', label: 'Account', icon: 'shield-check' }
	];

	let open = $state(false);
	afterNavigate(() => (open = false));

	const isCurrent = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);

	// Light theme, with Forest as the dark mode (design-system/guide/1-color.md).
	let theme = $state<'light' | 'forest'>('light');
	onMount(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const set = () => (theme = mq.matches ? 'forest' : 'light');
		set();
		mq.addEventListener('change', set);
		return () => mq.removeEventListener('change', set);
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="adm adm-shell" data-theme={theme}>
	<aside class="adm-side">
		<div class="adm-side__top">
			<a href="/admin"
				><img
					src={theme === 'forest' ? '/logo/tz-logo-on-dark.svg' : '/logo/tz-logo.svg'}
					alt="TuinZorg DP beheer"
					width="158"
					height="36"
				/></a
			>
			<button
				class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm adm-menu-btn"
				type="button"
				aria-expanded={open}
				aria-label={open ? 'Menu sluiten' : 'Menu openen'}
				onclick={() => (open = !open)}><Icon name={open ? 'x' : 'menu'} /></button
			>
		</div>
		<nav class="adm-nav" aria-label="Beheer" data-open={open ? '' : undefined}>
			{#each NAV as item, i (item?.href ?? `sep-${i}`)}
				{#if item}
					<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
						<Icon name={item.icon} />{item.label}
						{#if item.href === '/admin/aanvragen' && data.newRequests > 0}
							<span class="tz-badge tz-badge--info adm-nav__count"
								><span class="tz-badge__dot"></span>{data.newRequests}</span
							>
						{/if}
					</a>
				{:else}
					<span class="adm-nav__sep"></span>
				{/if}
			{/each}
			<a href="/" target="_blank" rel="noopener"><Icon name="external-link" />Website bekijken</a>
		</nav>
	</aside>
	<main class="adm-main" id="main">
		<PublishBanner
			count={data.publish.count}
			active={data.publish.active}
			lastFailed={data.publish.lastFailed}
		/>
		{@render children()}
	</main>
	<Toasts />
</div>
