<script lang="ts">
	import { enhance } from '$app/forms';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';
	import { formatDate, formatScore } from '$lib/format';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const g = data.google;
	let rating = $state(g.rating !== null ? formatScore(g.rating) : '');
	let ratingCount = $state(g.ratingCount !== null ? String(g.ratingCount) : '');
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
	const notice = $derived((form as { notice?: string } | null)?.notice);
</script>

<svelte:head><title>Google | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head"><h1>Google</h1></div>
<p class="adm-muted">
	De Google-score staat bovenaan de homepagina, alleen als er een score is ingevuld.
</p>

<FormMessages {form} />
{#if notice}<div class="tz-alert tz-alert--success" role="status">
		<Icon name="circle-check" />
		<div class="tz-alert__text">{notice}</div>
	</div>{/if}

<div class="adm-card">
	<h2>Score op de website</h2>
	<dl class="adm-kv">
		<dt>Score</dt>
		<dd>
			{data.google.rating !== null ? `${formatScore(data.google.rating)} op 5` : 'Niet ingevuld'}
		</dd>
		<dt>Aantal reviews</dt>
		<dd>{data.google.ratingCount ?? 'Niet ingevuld'}</dd>
		<dt>Laatst gecontroleerd</dt>
		<dd>
			{data.google.checkedOn ? formatDate(data.google.checkedOn) : 'Nog nooit'}{data.google
				.source === 'places'
				? ', automatisch'
				: data.google.source === 'manual'
					? ', met de hand'
					: ''}
		</dd>
	</dl>
</div>

{#if data.automatic}
	<div class="adm-card">
		<h2>Automatisch</h2>
		<p>
			De score wordt elke nacht bij Google opgehaald. Verandert ze, dan wordt de website vanzelf
			opnieuw gepubliceerd.
		</p>
		{#if !data.google.placeId}
			<div class="tz-alert tz-alert--warning" role="status">
				<Icon name="triangle-alert" />
				<div class="tz-alert__text">
					Er is nog geen place id. Vul die in bij <a href="/admin/instellingen">Instellingen</a>.
				</div>
			</div>
		{/if}
		<form
			method="post"
			action="?/refresh"
			class="adm-actions adm-actions--start"
			use:enhance={saving((b) => (busy = b))}
		>
			<button class={['tz-btn tz-btn--sm', busy && 'is-loading']} type="submit" disabled={busy}
				>{#if busy}<Icon name="loader-circle" class="tz-spin" />{/if}<span class="tz-btn__label"
					>Nu vernieuwen</span
				></button
			>
		</form>
	</div>
{:else}
	<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
		<div class="adm-card">
			<h2>Score invullen</h2>
			<p class="adm-muted">
				Neem de score en het aantal reviews over van uw Google-bedrijfsprofiel. Maak beide velden
				leeg om de score te verbergen.
			</p>
			<div class="adm-two">
				<FormField
					label="Score"
					name="rating"
					id="f-rating"
					inputmode="decimal"
					bind:value={rating}
					placeholder="4,9"
					hint="Van 1,0 tot 5,0."
					error={errors.rating}
				/>
				<FormField
					label="Aantal reviews"
					name="ratingCount"
					id="f-count"
					inputmode="numeric"
					bind:value={ratingCount}
					placeholder="23"
					error={errors.ratingCount}
				/>
			</div>
		</div>
		<SaveBar {busy} />
	</form>
{/if}
