<script lang="ts">
	import { enhance } from '$app/forms';
	import CountedField from '$lib/components/admin/CountedField.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';
	import { PERK_ICONS, perkIcon } from '$lib/content/perk-icons';
	import type { HomeBlocks } from '$lib/content/types';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const p = data.page;
	const blocks = p.blocks as unknown as Partial<HomeBlocks>;
	const isHome = p.slug === 'home';
	const PATHS: Record<string, string> = {
		home: '/',
		diensten: '/diensten',
		realisaties: '/realisaties',
		contact: '/contact',
		privacy: '/privacy'
	};

	let title = $state(p.title);
	let intro = $state(p.intro ?? '');
	let body = $state(p.body ?? '');
	let noindex = $state(p.noindex);
	// svelte-ignore state_referenced_locally
	let hero = $state(data.hero);
	// svelte-ignore state_referenced_locally
	let about1 = $state(data.about[0]);
	// svelte-ignore state_referenced_locally
	let about2 = $state(data.about[1]);
	let seoTitle = $state(p.seo_title ?? '');
	let metaDescription = $state(p.meta_description ?? '');

	let heroBlock = $state({
		title: blocks.hero?.title ?? '',
		accentWord: blocks.hero?.accentWord ?? '',
		lead: blocks.hero?.lead ?? '',
		usps: [0, 1, 2].map((i) => blocks.hero?.usps?.[i] ?? '')
	});
	let aboutBlock = $state({
		eyebrow: blocks.about?.eyebrow ?? '',
		title: blocks.about?.title ?? '',
		accentWord: blocks.about?.accentWord ?? '',
		lead: blocks.about?.lead ?? '',
		perks: (blocks.about?.perks?.length ? blocks.about.perks : [{ title: '', text: '' }]).map(
			(p, i) => ({ ...p, icon: perkIcon(p.icon, i) })
		)
	});
	let ctaBlock = $state({
		title: blocks.cta?.title ?? '',
		accentWord: blocks.cta?.accentWord ?? '',
		lead: blocks.cta?.lead ?? ''
	});

	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<svelte:head><title>{title} | Pagina's | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/paginas"><Icon name="chevron-left" /> Pagina's</a>
<div class="adm-head"><h1>{isHome ? 'Home' : title}</h1></div>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<FormField
			label={isHome ? 'Interne naam' : 'Titel'}
			name="title"
			id="f-title"
			required
			bind:value={title}
			error={errors.title}
		/>
		{#if !isHome && p.slug !== 'privacy'}
			<CountedField
				label="Inleiding"
				name="intro"
				as="textarea"
				rows={3}
				bind:value={intro}
				max={300}
			/>
		{/if}
		{#if p.slug === 'contact'}
			<ImageField label="Foto bij de contactgegevens (16:9)" name="hero" bind:media={hero} />
		{/if}
	</div>

	{#if isHome}
		<div class="adm-card">
			<h2>Hero</h2>
			<ImageField
				label="Grote foto"
				name="hero"
				bind:media={hero}
				hint="Kies een foto met een rustige linkerhelft: gazon, haag of lucht."
			/>
			<FormField
				label="Titel"
				name="hero_title"
				id="hero-title"
				bind:value={heroBlock.title}
				error={errors['hero.title']}
			/>
			<FormField
				label="Accentwoord"
				name="hero_accent"
				id="hero-accent"
				bind:value={heroBlock.accentWord}
				hint="Een stuk van de titel dat in het lichtgroen staat."
				error={errors['hero.accentWord']}
			/>
			<CountedField
				label="Inleiding"
				name="hero_lead"
				as="textarea"
				rows={3}
				bind:value={heroBlock.lead}
				max={240}
				error={errors['hero.lead']}
			/>
			<fieldset class="adm-repeat">
				<legend class="tz-label">Drie voordelen</legend>
				{#each heroBlock.usps as _, i (i)}<input
						class="tz-input"
						name="usp"
						bind:value={heroBlock.usps[i]}
						aria-label="Voordeel {i + 1}"
					/>{/each}
				{#if errors['hero.usps'] || errors['hero.usps.0']}<span class="tz-msg tz-msg--error"
						>{errors['hero.usps'] ?? errors['hero.usps.0']}</span
					>{/if}
			</fieldset>
		</div>
		<div class="adm-card">
			<h2>Waarom TuinZorg DP</h2>
			<FormField
				label="Kopje"
				name="about_eyebrow"
				id="about-eyebrow"
				bind:value={aboutBlock.eyebrow}
				error={errors['about.eyebrow']}
			/>
			<FormField
				label="Titel"
				name="about_title"
				id="about-title"
				bind:value={aboutBlock.title}
				error={errors['about.title']}
			/>
			<FormField
				label="Accentwoord"
				name="about_accent"
				id="about-accent"
				bind:value={aboutBlock.accentWord}
				error={errors['about.accentWord']}
			/>
			<CountedField
				label="Tekst"
				name="about_lead"
				as="textarea"
				rows={4}
				bind:value={aboutBlock.lead}
				max={500}
				error={errors['about.lead']}
			/>
			<fieldset class="adm-repeat">
				<legend class="tz-label"
					>Voordelen <span class="adm-muted">({aboutBlock.perks.length} van max. 6)</span></legend
				>
				{#each aboutBlock.perks as _, i (i)}
					<div class="adm-perk-row">
						<div class="adm-perk-icon">
							<span class="tz-icon-chip"><Icon name={aboutBlock.perks[i].icon} /></span>
							<select
								class="tz-input"
								name="perk_icon"
								bind:value={aboutBlock.perks[i].icon}
								aria-label="Voordeel {i + 1}, icoon"
							>
								{#each PERK_ICONS as opt (opt.name)}<option value={opt.name}>{opt.label}</option
									>{/each}
							</select>
						</div>
						<input
							class="tz-input"
							name="perk_title"
							bind:value={aboutBlock.perks[i].title}
							aria-label="Voordeel {i + 1}, titel"
						/>
						<input
							class="tz-input"
							name="perk_text"
							bind:value={aboutBlock.perks[i].text}
							aria-label="Voordeel {i + 1}, uitleg"
						/>
						{#if aboutBlock.perks.length > 1}
							<button
								type="button"
								class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
								aria-label="Voordeel {i + 1} verwijderen"
								onclick={() => aboutBlock.perks.splice(i, 1)}><Icon name="trash-2" /></button
							>
						{/if}
					</div>
				{/each}
				{#if aboutBlock.perks.length < 6}
					<button
						type="button"
						class="tz-btn tz-btn--outline tz-btn--sm"
						onclick={() =>
							aboutBlock.perks.push({
								title: '',
								text: '',
								icon: perkIcon(undefined, aboutBlock.perks.length)
							})}><Icon name="plus" /> Voordeel toevoegen</button
					>
				{/if}
				{#if errors['about.perks']}<span class="tz-msg tz-msg--error">{errors['about.perks']}</span
					>{/if}
			</fieldset>
			<div class="adm-two">
				<ImageField label="Foto 1 (3:4)" name="about_photo_1" bind:media={about1} />
				<ImageField label="Foto 2 (4:5)" name="about_photo_2" bind:media={about2} />
			</div>
		</div>
		<div class="adm-card">
			<h2>Oproep onderaan</h2>
			<FormField
				label="Titel"
				name="cta_title"
				id="cta-title"
				bind:value={ctaBlock.title}
				error={errors['cta.title']}
			/>
			<FormField
				label="Accentwoord"
				name="cta_accent"
				id="cta-accent"
				bind:value={ctaBlock.accentWord}
				error={errors['cta.accentWord']}
			/>
			<CountedField
				label="Tekst"
				name="cta_lead"
				as="textarea"
				rows={2}
				bind:value={ctaBlock.lead}
				max={240}
				error={errors['cta.lead']}
			/>
		</div>
	{/if}

	{#if p.slug === 'privacy'}
		<div class="adm-card">
			<CountedField
				label="Inleiding"
				name="intro"
				as="textarea"
				rows={2}
				bind:value={intro}
				max={300}
			/>
			<CountedField
				label="Tekst"
				name="body"
				as="textarea"
				rows={18}
				bind:value={body}
				hint="Markdown: ## voor een tussentitel, een lege regel voor een nieuwe alinea."
			/>
			<label class="tz-check"
				><input type="checkbox" name="noindex" bind:checked={noindex} />
				<span>Niet tonen in Google</span></label
			>
		</div>
	{/if}

	<SeoPanel
		bind:seoTitle
		bind:metaDescription
		path={PATHS[p.slug] ?? '/'}
		fallbackTitle={`${title} | TuinZorg DP`}
	/>
	<SaveBar {busy} preview={`/admin/preview${PATHS[p.slug] === '/' ? '' : PATHS[p.slug]}`} />
</form>
