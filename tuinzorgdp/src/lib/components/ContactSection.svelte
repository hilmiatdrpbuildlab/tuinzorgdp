<script lang="ts">
	import type { Media, SiteSettings } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import { telHref, whatsappHref } from '$lib/format';
	import { SIZES } from '$lib/media';
	import AccentTitle from './AccentTitle.svelte';
	import ContactForm from './ContactForm.svelte';
	import MediaSlot from './MediaSlot.svelte';
	import QuoteForm from './QuoteForm.svelte';
	import type { Tile } from './ServiceTiles.svelte';

	let {
		settings,
		tiles,
		photo = null,
		areaLabel = null,
		title = 'Vraag uw gratis offerte aan',
		accentWord = 'gratis',
		lead = 'Vul het formulier in, bel of stuur een e-mail. Wij nemen zo snel mogelijk contact met u op en bespreken wat uw tuin nodig heeft.',
		turnstileSiteKey = null,
		presetService = null,
		presetMunicipality = null,
		level = 2
	}: {
		settings: SiteSettings;
		tiles: Tile[];
		photo?: Media | null;
		areaLabel?: string | null;
		title?: string;
		accentWord?: string | null;
		lead?: string | null;
		turnstileSiteKey?: string | null;
		presetService?: string | null;
		presetMunicipality?: string | null;
		level?: 1 | 2;
	} = $props();

	const c = $derived(settings.company);
	let tab = $state<'offerte' | 'vraag'>('offerte');
	let tabOfferte: HTMLButtonElement | undefined = $state();
	let tabVraag: HTMLButtonElement | undefined = $state();

	function onTabKey(e: KeyboardEvent) {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		e.preventDefault();
		tab = tab === 'offerte' ? 'vraag' : 'offerte';
		(tab === 'offerte' ? tabOfferte : tabVraag)?.focus();
	}
</script>

<section class="tz-section" id="contact" aria-labelledby="contact-title">
	<div class="tz-container tz-contact">
		<div class="tz-contact__aside">
			<span class="tz-eyebrow tz-eyebrow--pill app-self-start"
				><span class="tz-leaf"></span>Contact</span
			>
			<AccentTitle {title} {accentWord} {level} id="contact-title" class="t-h1" />
			{#if lead}<p class="t-lead">{lead}</p>{/if}
			<div class="tz-contact__lines">
				{#if c.phone}
					<a class="tz-contact__line" href={telHref(c.phone)}
						><span class="tz-icon-chip"><Icon name="phone" /></span><span
							><small>Bel ons</small><strong>{c.phone}</strong></span
						></a
					>
				{/if}
				{#if c.email}
					<a class="tz-contact__line" href="mailto:{c.email}"
						><span class="tz-icon-chip"><Icon name="mail" /></span><span
							><small>E-mail</small><strong>{c.email}</strong></span
						></a
					>
				{/if}
				{#if c.whatsapp}
					<a class="tz-contact__line" href={whatsappHref(c.whatsapp)} rel="noopener noreferrer"
						><span class="tz-icon-chip"><Icon name="whatsapp" /></span><span
							><small>WhatsApp</small><strong>Stuur een foto van uw tuin</strong></span
						></a
					>
				{/if}
				{#if areaLabel}
					<div class="tz-contact__line">
						<span class="tz-icon-chip"><Icon name="map-pin" /></span><span
							><small>Werkgebied</small><strong>{areaLabel}</strong></span
						>
					</div>
				{/if}
			</div>
			{#if photo}<MediaSlot media={photo} ratio="16x9" lg sizes={SIZES.half} />{/if}
		</div>
		<div class="tz-contact__card" id="offerte">
			<div class="tz-segment" role="tablist" aria-label="Soort aanvraag">
				<button
					type="button"
					role="tab"
					id="tab-offerte"
					aria-controls="panel-offerte"
					aria-selected={tab === 'offerte'}
					tabindex={tab === 'offerte' ? 0 : -1}
					bind:this={tabOfferte}
					onclick={() => (tab = 'offerte')}
					onkeydown={onTabKey}>Offerte aanvragen</button
				>
				<button
					type="button"
					role="tab"
					id="tab-vraag"
					aria-controls="panel-vraag"
					aria-selected={tab === 'vraag'}
					tabindex={tab === 'vraag' ? 0 : -1}
					bind:this={tabVraag}
					onclick={() => (tab = 'vraag')}
					onkeydown={onTabKey}>Algemene vraag</button
				>
			</div>
			<div
				role="tabpanel"
				id="panel-offerte"
				aria-labelledby="tab-offerte"
				hidden={tab !== 'offerte'}
			>
				<QuoteForm
					{tiles}
					{turnstileSiteKey}
					{presetService}
					{presetMunicipality}
					phone={c.phone}
				/>
			</div>
			<div role="tabpanel" id="panel-vraag" aria-labelledby="tab-vraag" hidden={tab !== 'vraag'}>
				<ContactForm {turnstileSiteKey} phone={c.phone} />
			</div>
		</div>
	</div>
</section>
