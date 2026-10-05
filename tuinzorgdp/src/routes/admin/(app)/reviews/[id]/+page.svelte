<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';
	import { reviewGuards } from '$lib/rules';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const r = data.review;
	let quote = $state(r.quote);
	let author = $state(r.author_name);
	let place = $state(r.place ?? '');
	let serviceId = $state(r.service_id ?? '');
	let rating = $state(String(r.rating));
	let source = $state(r.source);
	let sourceUrl = $state(r.source_url ?? '');
	let reviewedOn = $state(r.reviewed_on ?? '');
	let consent = $state(r.consent_confirmed);
	let published = $state(r.is_published);
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);

	// Live guard, so the client sees before saving that consent is needed to publish.
	const consentGuard = $derived(
		published ? reviewGuards({ consent_confirmed: consent })[0] : undefined
	);
</script>

<svelte:head><title>{author} | Reviews | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/reviews"><Icon name="chevron-left" /> Reviews</a>
<div class="adm-head"><h1>{author || 'Review'}</h1></div>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<FormField
			label="Review"
			name="quote"
			id="f-quote"
			as="textarea"
			required
			bind:value={quote}
			error={errors.quote}
			hint="De tekst zoals de klant hem schreef."
		/>
		<div class="adm-two">
			<FormField
				label="Naam klant"
				name="author_name"
				id="f-author"
				required
				bind:value={author}
				error={errors.author_name}
				hint="Bijvoorbeeld: Els V."
			/>
			<FormField label="Gemeente" name="place" id="f-place" optional bind:value={place} />
		</div>
		<div class="adm-two">
			<div class="tz-field">
				<label class="tz-label" for="f-svc"
					>Dienst <span class="tz-label__opt">(optioneel)</span></label
				>
				<div class="tz-select-wrap">
					<select class="tz-select" id="f-svc" name="service_id" bind:value={serviceId}
						><option value="">Geen</option>{#each data.services as s (s.id)}<option value={s.id}
								>{s.title}</option
							>{/each}</select
					><Icon name="chevron-down" />
				</div>
			</div>
			<div class="tz-field">
				<label class="tz-label" for="f-rating">Score</label>
				<div class="tz-select-wrap">
					<select class="tz-select" id="f-rating" name="rating" bind:value={rating}
						>{#each ['5', '4', '3', '2', '1'] as n (n)}<option value={n}
								>{n} {n === '1' ? 'ster' : 'sterren'}</option
							>{/each}</select
					><Icon name="chevron-down" />
				</div>
			</div>
		</div>
	</div>

	<div class="adm-card">
		<fieldset class="tz-field">
			<legend class="tz-label">Bron</legend>
			<div class="tz-checks">
				<label class="tz-check"
					><input type="radio" name="source" value="google" bind:group={source} />
					<span>Google</span></label
				>
				<label class="tz-check"
					><input type="radio" name="source" value="direct" bind:group={source} />
					<span>Rechtstreeks</span></label
				>
			</div>
		</fieldset>
		<FormField
			label="Link naar de review"
			name="source_url"
			id="f-url"
			type="url"
			optional
			bind:value={sourceUrl}
			error={errors.source_url}
		/>
		<FormField
			label="Datum van de review"
			name="reviewed_on"
			id="f-date"
			type="date"
			optional
			bind:value={reviewedOn}
		/>
	</div>

	<div class="adm-card">
		<div class={['tz-field', consentGuard && 'tz-field--error']}>
			<label class="tz-check"
				><input type="checkbox" name="consent_confirmed" bind:checked={consent} />
				<span>Klant gaf toestemming om deze review te tonen</span></label
			>
			{#if consentGuard}<span class="tz-msg tz-msg--error"
					><Icon name="circle-x" /> {consentGuard.message}</span
				>{/if}
		</div>
		<label class="tz-check"
			><input type="checkbox" name="is_published" bind:checked={published} />
			<span>Zichtbaar op de website</span></label
		>
	</div>

	<SaveBar {busy} />
</form>

<div class="adm-actions adm-actions--start">
	<ConfirmDialog item={`Review ${r.author_name}`} />
</div>
