<script lang="ts">
	import type { SiteSettings } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { telHref, whatsappHref } from '$lib/format';
	import { hoursText } from '$lib/hours';
	import MapEmbed from './MapEmbed.svelte';

	let {
		settings,
		services,
		areas,
		quoteHref = '/contact#offerte'
	}: {
		settings: SiteSettings;
		services: { slug: string; title: string }[];
		areas: { slug: string; name: string }[];
		quoteHref?: string;
	} = $props();

	const c = $derived(settings.company);
	const hours = $derived(hoursText(settings.hours));
	const showStreet = $derived(!!c.street && c.showStreet !== false);
	const place = $derived([c.postcode, c.city].filter(Boolean).join(' '));
	const year = new Date().getFullYear();
</script>

<footer class="tz-footer" data-theme="forest" aria-labelledby="footer-title">
	<h2 class="tz-sr" id="footer-title">{c.name}, contact en werkgebied</h2>
	<div class="tz-container">
		<div class="tz-footer__top">
			<div class="tz-footer__brand">
				<img src="/logo/tz-logo-on-dark.svg" alt={c.name} width="245" height="56" loading="lazy" />
				<p>
					Professioneel en betrouwbaar tuinonderhoud voor particulieren en bedrijven.
					{#if c.city}Gevestigd in {c.city}{#if c.region}, actief in heel {c.region}{/if}.{:else if c.region}Actief
						in heel {c.region}.{/if}
				</p>
				<a class="tz-btn tz-btn--sm" href={quoteHref}>Offerte aanvragen</a>
				<div class="tz-footer__social">
					{#if settings.socials.instagram}<a
							href={settings.socials.instagram}
							rel="noopener noreferrer"
							aria-label={`${c.name} op Instagram`}><Icon name="instagram" /></a
						>{/if}
					{#if settings.socials.facebook}<a
							href={settings.socials.facebook}
							rel="noopener noreferrer"
							aria-label={`${c.name} op Facebook`}><Icon name="facebook" /></a
						>{/if}
					{#if c.whatsapp}<a
							href={whatsappHref(c.whatsapp)}
							rel="noopener noreferrer"
							aria-label={`Stuur ${c.name} een WhatsApp-bericht`}><Icon name="whatsapp" /></a
						>{/if}
					{#if settings.google.profileUrl}<a
							href={settings.google.profileUrl}
							rel="noopener noreferrer"
							aria-label={`${c.name} op Google`}><Icon name="google" /></a
						>{/if}
				</div>
			</div>
			<div class="tz-footer__cols">
				<nav class="tz-footer__col" aria-labelledby="f-nav">
					<h3 id="f-nav">Menu</h3>
					<ul>
						<li><a href="/">Home</a></li>
						<li><a href="/diensten">Diensten</a></li>
						<li><a href="/realisaties">Realisaties</a></li>
						<li><a href="/contact">Contact</a></li>
						<li><a href={quoteHref}>Offerte aanvragen</a></li>
					</ul>
				</nav>
				<nav class="tz-footer__col" aria-labelledby="f-dien">
					<h3 id="f-dien">Diensten</h3>
					<ul>
						{#each services as s (s.slug)}<li><a href="/diensten/{s.slug}">{s.title}</a></li>{/each}
					</ul>
				</nav>
				<div class="tz-footer__col tz-footer__col--wide">
					<h3>Contact</h3>
					<address data-nap>
						<strong class="app-strong">{c.name}</strong>
						{#if showStreet || place}
							<span
								><Icon name="map-pin" /><span
									>{#if showStreet}{c.street}<br />{/if}{place
										? `${place}, België`
										: 'België'}</span
								></span
							>
						{/if}
						{#if c.phone}<a href={telHref(c.phone)}><Icon name="phone" />{c.phone}</a>{/if}
						{#if c.email}<a href="mailto:{c.email}"><Icon name="mail" />{c.email}</a>{/if}
						{#if hours}<span><Icon name="clock" /><span>{hours}</span></span>{/if}
					</address>
				</div>
				{#if areas.length}
					<div class="tz-footer__col tz-footer__col--wide">
						<h3>Werkgebied</h3>
						<ul class="tz-areas">
							{#each areas as a (a.slug)}<li>
									<a href="/tuinonderhoud/{a.slug}">{a.name}</a>
								</li>{/each}
							<li>en omstreken</li>
						</ul>
					</div>
				{/if}
				{#if settings.mapsEmbedUrl}
					<div class="tz-footer__col tz-footer__col--wide">
						<MapEmbed src={settings.mapsEmbedUrl} class="tz-footer__map" />
					</div>
				{/if}
			</div>
		</div>
		<div class="tz-footer__bottom">
			<span
				>© {year}
				{c.name}{#if c.vat}&nbsp;· BTW {c.vat}{/if}</span
			>
			<span><a href="/privacy">Privacybeleid</a> · <a href="/sitemap.xml">Sitemap</a></span>
		</div>
	</div>
</footer>
