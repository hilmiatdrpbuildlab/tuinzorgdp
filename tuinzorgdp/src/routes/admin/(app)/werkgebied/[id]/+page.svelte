<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import CountedField from '$lib/components/admin/CountedField.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import GuardList from '$lib/components/admin/GuardList.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';
	import { LIMITS, areaGuards, seoGuards } from '$lib/rules';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const a = data.area;
	let name = $state(a.name);
	let slug = $state(a.slug);
	let postcode = $state(a.postcode ?? '');
	let primary = $state(a.is_primary);
	let intro = $state(a.intro ?? '');
	let published = $state(a.is_published);
	let seoTitle = $state(a.seo_title ?? '');
	let metaDescription = $state(a.meta_description ?? '');
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);

	// Live guards, so the client sees what is missing before saving.
	const live = $derived(
		published
			? [
					...areaGuards({ intro }),
					...seoGuards({ seo_title: seoTitle, meta_description: metaDescription })
				]
			: []
	);
</script>

<svelte:head><title>{name} | Werkgebied | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/werkgebied"><Icon name="chevron-left" /> Werkgebied</a>
<div class="adm-head"><h1>{name || 'Gemeente'}</h1></div>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<div class="adm-two">
			<FormField
				label="Naam"
				name="name"
				id="f-name"
				required
				bind:value={name}
				error={errors.name}
			/>
			<FormField
				label="Postcode"
				name="postcode"
				id="f-postcode"
				optional
				inputmode="numeric"
				bind:value={postcode}
				error={errors.postcode}
			/>
		</div>
		<label class="tz-check"
			><input type="checkbox" name="is_primary" bind:checked={primary} />
			<span>Hoofdgemeente (maar één gemeente)</span></label
		>
	</div>

	<div class="adm-card">
		<CountedField
			label="Intro"
			name="intro"
			as="textarea"
			rows={10}
			bind:value={intro}
			minWords={LIMITS.areaIntroWords}
			error={errors.intro}
			hint="Schrijf iets eigen aan deze gemeente: wijken, soorten tuinen, wat u er vaak doet. Markdown: een lege regel maakt een nieuwe alinea, ## een tussentitel."
		/>
		<label class="tz-check"
			><input type="checkbox" name="is_published" bind:checked={published} />
			<span>Zichtbaar op de website</span></label
		>
		<GuardList guards={live} />
	</div>

	<details class="adm-panel">
		<summary>Adres van de pagina</summary>
		<FormField
			label="Slug"
			name="slug"
			id="f-slug"
			bind:value={slug}
			error={errors.slug}
			hint={`tuinzorgdp.be/tuinonderhoud/${slug}. Wijzigen maakt automatisch een doorverwijzing.`}
		/>
	</details>
	<SeoPanel
		bind:seoTitle
		bind:metaDescription
		path={`/tuinonderhoud/${slug}`}
		fallbackTitle={`Tuinonderhoud in ${name} | TuinZorg DP`}
	/>
	<SaveBar {busy} preview={`/admin/preview/tuinonderhoud/${a.slug}`} />
</form>

<div class="adm-actions adm-actions--start">
	<ConfirmDialog
		item={a.name}
		extra="Realisaties in deze gemeente blijven bestaan, maar zonder gemeente."
	/>
</div>
