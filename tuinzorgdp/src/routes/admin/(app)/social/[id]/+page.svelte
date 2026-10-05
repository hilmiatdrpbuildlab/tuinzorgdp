<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import CountedField from '$lib/components/admin/CountedField.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const p = data.post;
	let network = $state(p.network);
	let url = $state(p.url);
	// svelte-ignore state_referenced_locally
	let photo = $state(data.photo);
	let caption = $state(p.caption ?? '');
	let postedOn = $state(p.posted_on ?? '');
	let published = $state(p.is_published);
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);

	// Live guard, so the client sees what is missing before saving.
	const live = $derived(
		!published
			? null
			: !photo
				? 'Kies een foto voor dit bericht.'
				: !photo.alt.trim()
					? 'De foto heeft nog geen alt-tekst. Beschrijf wat u ziet.'
					: null
	);
</script>

<svelte:head><title>Social-bericht | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/social"><Icon name="chevron-left" /> Social</a>
<div class="adm-head">
	<h1>{network === 'instagram' ? 'Instagram-bericht' : 'Facebook-bericht'}</h1>
</div>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<fieldset class="tz-field">
			<legend class="tz-label">Netwerk</legend>
			<div class="tz-checks">
				<label class="tz-check"
					><input type="radio" name="network" value="instagram" bind:group={network} />
					<span>Instagram</span></label
				>
				<label class="tz-check"
					><input type="radio" name="network" value="facebook" bind:group={network} />
					<span>Facebook</span></label
				>
			</div>
		</fieldset>
		<FormField
			label="Link naar het bericht"
			name="url"
			id="f-url"
			type="url"
			required
			bind:value={url}
			error={errors.url}
			hint="Open het bericht en kopieer de link uit de adresbalk."
		/>
		<FormField
			label="Geplaatst op"
			name="posted_on"
			id="f-date"
			type="date"
			optional
			bind:value={postedOn}
		/>
	</div>

	<div class="adm-card">
		<ImageField
			label="Foto (vierkant)"
			name="media"
			bind:media={photo}
			hint="Een eigen foto van het bericht. De website laadt niets van Instagram of Facebook."
		/>
		<CountedField
			label="Bijschrift"
			name="caption"
			bind:value={caption}
			max={data.captionMax}
			error={errors.caption}
			hint="Optioneel. Kort, zonder hashtags."
		/>
		<label class="tz-check"
			><input type="checkbox" name="is_published" bind:checked={published} />
			<span>Zichtbaar op de website</span></label
		>
		{#if live}
			<div class="tz-alert tz-alert--warning" role="status">
				<Icon name="triangle-alert" />
				<div>
					<div class="tz-alert__title">Nog niet klaar om te publiceren</div>
					<div class="tz-alert__text">{live}</div>
				</div>
			</div>
		{/if}
	</div>

	<SaveBar {busy} />
</form>

<div class="adm-actions adm-actions--start">
	<ConfirmDialog
		item="Social-bericht"
		extra="De foto wordt ook verwijderd als ze nergens anders gebruikt wordt."
	/>
</div>
