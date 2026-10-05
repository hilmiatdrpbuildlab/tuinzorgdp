<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import CountedField from '$lib/components/admin/CountedField.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import RepeatRows from '$lib/components/admin/RepeatRows.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';
	import { LIMITS } from '$lib/rules';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const s = data.service;
	let title = $state(s.title);
	let slug = $state(s.slug);
	let shortLabel = $state(s.short_label);
	let subtitle = $state(s.subtitle ?? '');
	let summary = $state(s.summary);
	let body = $state(s.body ?? '');
	let bullets = $state([...(s.bullets ?? [])]);
	let icon = $state(s.icon);
	// svelte-ignore state_referenced_locally
	let cover = $state(data.cover);
	let featured = $state(s.is_featured);
	let published = $state(s.is_published);
	let seoTitle = $state(s.seo_title ?? '');
	let metaDescription = $state(s.meta_description ?? '');
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<svelte:head><title>{title} | Diensten | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/diensten"><Icon name="chevron-left" /> Diensten</a>
<div class="adm-head"><h1>{title || 'Dienst'}</h1></div>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<div class="adm-two">
			<FormField
				label="Titel"
				name="title"
				id="f-title"
				required
				bind:value={title}
				error={errors.title}
			/>
			<FormField
				label="Kort label"
				name="short_label"
				id="f-short"
				required
				bind:value={shortLabel}
				hint="Voor de galerijfilter en de tegels in het formulier, bv. Gazon."
				error={errors.short_label}
			/>
		</div>
		<FormField
			label="Ondertitel"
			name="subtitle"
			id="f-sub"
			bind:value={subtitle}
			hint="Bijvoorbeeld: Strak gazon, nette randen"
		/>
		<CountedField
			label="Samenvatting"
			name="summary"
			as="textarea"
			rows={3}
			bind:value={summary}
			max={LIMITS.summary}
			required
			error={errors.summary}
			hint="Staat op de dienstkaart."
		/>
		<RepeatRows
			label="Checklist"
			name="bullets"
			bind:rows={bullets}
			max={LIMITS.bullets}
			hint="De uitgelichte kaart toont de eerste drie."
		/>
		<div class="tz-field">
			<span class="tz-label">Icoon</span>
			<div class="tz-tiles tz-tiles--4">
				{#each data.icons as name (name)}
					<label class="tz-tile"
						><input type="radio" name="icon" value={name} bind:group={icon} /><Icon {name} /><span
							class="tz-tile__name">{name}</span
						><span class="tz-tile__box"></span></label
					>
				{/each}
			</div>
		</div>
		<ImageField
			label="Foto (4:3, uitgelicht 16:9)"
			name="cover"
			bind:media={cover}
			hint="Zonder foto toont de kaart een lege plek."
		/>
		<CountedField
			label="Tekst op de dienstpagina"
			name="body"
			as="textarea"
			rows={8}
			bind:value={body}
			hint="Markdown: een lege regel maakt een nieuwe alinea, ## een tussentitel."
		/>
		<label class="tz-check"
			><input type="checkbox" name="is_featured" bind:checked={featured} />
			<span>Uitgelicht (groot bovenaan, maar één dienst)</span></label
		>
		<label class="tz-check"
			><input type="checkbox" name="is_published" bind:checked={published} />
			<span>Zichtbaar op de website</span></label
		>
	</div>
	<details class="adm-panel">
		<summary>Adres van de pagina</summary>
		<FormField
			label="Slug"
			name="slug"
			id="f-slug"
			bind:value={slug}
			hint={`tuinzorgdp.be/diensten/${slug}. Wijzigen maakt automatisch een doorverwijzing.`}
		/>
	</details>
	<SeoPanel
		bind:seoTitle
		bind:metaDescription
		path={`/diensten/${slug}`}
		fallbackTitle={`${title} | TuinZorg DP`}
	/>
	<SaveBar {busy} preview={`/admin/preview/diensten/${s.slug}`} />
</form>

<div class="adm-actions adm-actions--start">
	<ConfirmDialog item={s.title} extra="Een dienst met realisaties kan niet verwijderd worden." />
</div>
