<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import CountedField from '$lib/components/admin/CountedField.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import GalleryEditor, { type GalleryRow } from '$lib/components/admin/GalleryEditor.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const p = data.project;
	let title = $state(p.title);
	let slug = $state(p.slug);
	let serviceId = $state(p.service_id);
	let areaId = $state(p.service_area_id ?? '');
	let summary = $state(p.summary ?? '');
	let body = $state(p.body ?? '');
	let completedOn = $state(p.completed_on ?? '');
	// svelte-ignore state_referenced_locally
	let cover = $state(data.cover);
	// svelte-ignore state_referenced_locally
	let photos = $state<GalleryRow[]>(data.photos);
	let featured = $state(p.is_featured);
	let published = $state(p.is_published);
	let seoTitle = $state(p.seo_title ?? '');
	let metaDescription = $state(p.meta_description ?? '');
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);

	// Live guards, so the client sees what is missing before saving.
	const live = $derived(
		[
			!cover ? 'Kies een omslagfoto.' : null,
			photos.length === 0 ? 'Voeg minstens één foto toe aan de galerij.' : null,
			photos.some((x) => !x.alt.trim()) ? 'Elke foto heeft alt-tekst nodig.' : null
		].filter(Boolean) as string[]
	);
</script>

<svelte:head><title>{title} | Realisaties | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/realisaties"><Icon name="chevron-left" /> Realisaties</a>
<div class="adm-head"><h1>{title || 'Realisatie'}</h1></div>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<FormField
			label="Titel"
			name="title"
			id="f-title"
			required
			bind:value={title}
			error={errors.title}
		/>
		<div class="adm-two">
			<div class="tz-field">
				<label class="tz-label" for="f-svc">Dienst</label>
				<div class="tz-select-wrap">
					<select class="tz-select" id="f-svc" name="service_id" bind:value={serviceId}
						>{#each data.services as s (s.id)}<option value={s.id}>{s.title}</option>{/each}</select
					><Icon name="chevron-down" />
				</div>
			</div>
			<div class="tz-field">
				<label class="tz-label" for="f-area"
					>Gemeente <span class="tz-label__opt">(optioneel)</span></label
				>
				<div class="tz-select-wrap">
					<select class="tz-select" id="f-area" name="service_area_id" bind:value={areaId}
						><option value="">Geen</option>{#each data.areas as a (a.id)}<option value={a.id}
								>{a.name}</option
							>{/each}</select
					><Icon name="chevron-down" />
				</div>
				<span class="tz-hint">Gemeenten voegt u toe onder Werkgebied.</span>
			</div>
		</div>
		<FormField
			label="Uitgevoerd op"
			name="completed_on"
			id="f-date"
			type="date"
			optional
			bind:value={completedOn}
		/>
		<CountedField
			label="Korte beschrijving"
			name="summary"
			as="textarea"
			rows={2}
			bind:value={summary}
			max={300}
		/>
	</div>

	<div class="adm-card">
		<h2>Foto's</h2>
		<ImageField label="Omslagfoto" name="cover" bind:media={cover} />
		<GalleryEditor bind:rows={photos} />
	</div>

	<div class="adm-card">
		<CountedField
			label="Tekst"
			name="body"
			as="textarea"
			rows={6}
			bind:value={body}
			hint="Optioneel. Markdown: een lege regel maakt een nieuwe alinea."
		/>
		<label class="tz-check"
			><input type="checkbox" name="is_featured" bind:checked={featured} />
			<span>Uitgelicht</span></label
		>
		<label class="tz-check"
			><input type="checkbox" name="is_published" bind:checked={published} />
			<span>Gepubliceerd</span></label
		>
		{#if published && live.length}
			<div class="tz-alert tz-alert--warning" role="status">
				<Icon name="triangle-alert" />
				<div>
					<div class="tz-alert__title">Nog niet klaar om te publiceren</div>
					<ul class="adm-guards">
						{#each live as g (g)}<li>{g}</li>{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>

	<details class="adm-panel">
		<summary>Adres van de pagina</summary>
		<FormField
			label="Slug"
			name="slug"
			id="f-slug"
			bind:value={slug}
			hint={`tuinzorgdp.be/realisaties/${slug}. Wijzigen maakt automatisch een doorverwijzing.`}
		/>
	</details>
	<SeoPanel
		bind:seoTitle
		bind:metaDescription
		path={`/realisaties/${slug}`}
		fallbackTitle={`${title} | TuinZorg DP`}
	/>
	<SaveBar {busy} preview={`/admin/preview/realisaties/${p.slug}`} />
</form>

<div class="adm-actions adm-actions--start">
	<ConfirmDialog
		item={p.title}
		extra="De foto's die nergens anders gebruikt worden, worden ook verwijderd."
	/>
</div>
