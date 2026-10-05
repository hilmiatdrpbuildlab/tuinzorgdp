<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { toast } from '$lib/components/toast.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { formatDateTime, telHref } from '$lib/format';

	let { data } = $props();
	const r = $derived(data.request);
	const name = $derived([r.first_name, r.last_name].filter(Boolean).join(' '));
	/** Belgian numbers to wa.me format: 0470 12 34 56 → 32470123456. */
	const waNumber = $derived.by(() => {
		const digits = (r.phone ?? '').replace(/\D/g, '');
		if (!digits) return null;
		if (digits.startsWith('00')) return digits.slice(2);
		if (digits.startsWith('0')) return `32${digits.slice(1)}`;
		return digits;
	});
	const subject = $derived(
		encodeURIComponent(
			r.kind === 'offerte' ? 'Uw offerteaanvraag bij TuinZorg DP' : 'Uw vraag aan TuinZorg DP'
		)
	);

	// The photo links expire after 5 minutes; reload them before that.
	onMount(() => {
		const ms = new Date(data.expiresAt).getTime() - Date.now() - 20_000;
		const t = setTimeout(() => invalidateAll(), Math.max(ms, 30_000));
		return () => clearTimeout(t);
	});
</script>

<svelte:head><title>{name} | Aanvragen | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/aanvragen"><Icon name="chevron-left" /> Aanvragen</a>
<div class="adm-head">
	<h1>{r.kind === 'offerte' ? 'Offerte' : 'Vraag'}: {name}</h1>
</div>
<p class="adm-muted">
	Ontvangen op {formatDateTime(r.created_at)}{r.notified_at
		? ''
		: ' · de melding per mail is niet verstuurd'}
</p>

<div class="adm-actions adm-actions--start">
	{#if r.phone}<a class="tz-btn tz-btn--sm" href={telHref(r.phone)}><Icon name="phone" /> Bellen</a
		>{/if}
	<a class="tz-btn tz-btn--outline tz-btn--sm" href="mailto:{r.email}?subject={subject}"
		><Icon name="mail" /> E-mailen</a
	>
	{#if waNumber}<a
			class="tz-btn tz-btn--outline tz-btn--sm"
			href="https://wa.me/{waNumber}"
			rel="noopener noreferrer"><Icon name="whatsapp" /> WhatsApp</a
		>{/if}
</div>

<form
	method="post"
	action="?/status"
	class="adm-card"
	use:enhance={() =>
		async ({ result, update }) => {
			await update({ reset: false });
			if (result.type === 'success') toast('Status opgeslagen');
		}}
>
	<div class="adm-filters">
		<label class="tz-label" for="status">Status</label>
		<div class="tz-select-wrap">
			<select class="tz-select" id="status" name="status" value={r.status}>
				<option value="nieuw">Nieuw</option>
				<option value="beantwoord">Beantwoord</option>
				<option value="gepland">Gepland</option>
				<option value="archief">Archief</option>
			</select><Icon name="chevron-down" />
		</div>
		<button class="tz-btn tz-btn--sm" type="submit">Opslaan</button>
	</div>
</form>

{#if data.tiles.length}
	<section class="adm-card" aria-labelledby="svc">
		<h2 id="svc">Diensten</h2>
		<div class="tz-tiles tz-tiles--4">
			{#each data.tiles as t (t.slug)}
				<div class="tz-tile" style="cursor: default">
					<Icon name={t.icon} /><span class="tz-tile__name">{t.label}</span>
				</div>
			{/each}
		</div>
	</section>
{/if}

<section class="adm-card" aria-labelledby="det">
	<h2 id="det">Gegevens</h2>
	<dl class="adm-kv">
		<dt>Naam</dt>
		<dd>{name}</dd>
		<dt>E-mail</dt>
		<dd><a href="mailto:{r.email}">{r.email}</a></dd>
		{#if r.phone}<dt>Telefoon</dt>
			<dd><a href={telHref(r.phone)}>{r.phone}</a></dd>{/if}
		{#if r.street}<dt>Adres</dt>
			<dd>{r.street}, {r.postcode} {r.municipality}</dd>{/if}
		{#if r.timing}<dt>Timing</dt>
			<dd>{r.timing}</dd>{/if}
		{#if r.garden_size}<dt>Oppervlakte</dt>
			<dd>{r.garden_size}</dd>{/if}
		{#if r.consent_at}<dt>Toestemming</dt>
			<dd>{formatDateTime(r.consent_at)}</dd>{/if}
	</dl>
	<h3 class="t-h4">Bericht</h3>
	<p class="adm-message">{r.message}</p>
</section>

{#if data.photos.length}
	<section class="adm-card" aria-labelledby="pics">
		<h2 id="pics">Foto's van de tuin ({data.photos.length})</h2>
		<div class="adm-photos">
			{#each data.photos as p, i (p.id)}
				<a href={p.url} target="_blank" rel="noopener noreferrer"
					><img src={p.url} alt="Foto {i + 1} van de tuin" loading="lazy" /></a
				>
			{/each}
		</div>
		<p class="adm-muted">
			Deze foto's zijn privé en alleen hier te zien. De links verlopen na 5 minuten.
		</p>
	</section>
{/if}

<div class="adm-actions adm-actions--start">
	<ConfirmDialog item={`Aanvraag van ${name}`} extra="De foto's worden ook verwijderd." />
</div>
