<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';

	let { data, form } = $props();
	let fromPath = $state('');
	let toPath = $state('');
	let status = $state('301');
	let note = $state('');
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);

	// A successful add clears the form for the next one.
	$effect(() => {
		if (form?.saved) {
			fromPath = '';
			toPath = '';
			note = '';
			status = '301';
		}
	});

	const PROBLEM = { empty: 'Leeg', long: 'Te lang' } as const;
</script>

<svelte:head><title>SEO & redirects | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head"><h1>SEO & redirects</h1></div>

<FormMessages {form} />

<section class="adm-stack" aria-labelledby="seo-title">
	<h2 class="t-h4" id="seo-title">Titels en beschrijvingen</h2>
	<p class="adm-muted">
		Wat Google toont voor elke pagina. Een titel mag {data.limits.title} tekens hebben, een beschrijving
		{data.limits.description}. Zonder eigen tekst gebruikt de website de naam of de samenvatting.
		Kies Aanpassen om de tekst te wijzigen.
	</p>
	{#if data.problems}
		<div class="tz-alert tz-alert--warning" role="status">
			<Icon name="triangle-alert" />
			<div class="tz-alert__text">
				{data.problems} zichtbare pagina{data.problems === 1 ? ' heeft' : "'s hebben"} een titel of beschrijving
				die leeg of te lang is.
			</div>
		</div>
	{/if}
	<div class="adm-scroll">
		<table class="adm-table seo-table">
			<thead>
				<tr
					><th scope="col">Pagina</th><th scope="col">Titel</th><th scope="col">Beschrijving</th><th
						scope="col"><span class="tz-sr">Actie</span></th
					></tr
				>
			</thead>
			<tbody>
				{#each data.rows as r (r.path)}
					<tr>
						<td>
							<div class="seo-name">{r.name}</div>
							<div class="adm-muted">{r.kind} · {r.path}</div>
							{#if r.hidden}<span class="tz-badge"
									><span class="tz-badge__dot"></span>Niet zichtbaar</span
								>{/if}
						</td>
						<td>
							<div>{r.title || '–'}</div>
							<div class={['adm-count seo-count', r.titleCheck.problem && 'adm-count--bad']}>
								{r.titleCheck.length} / {data.limits.title}{r.titleCustom ? '' : ' · automatisch'}
								{#if r.titleCheck.problem}<span class="tz-badge tz-badge--danger"
										>{PROBLEM[r.titleCheck.problem]}</span
									>{/if}
							</div>
						</td>
						<td>
							<div>{r.description || '–'}</div>
							<div class={['adm-count seo-count', r.descriptionCheck.problem && 'adm-count--bad']}>
								{r.descriptionCheck.length} / {data.limits.description}{r.descriptionCustom
									? ''
									: ' · automatisch'}
								{#if r.descriptionCheck.problem}<span class="tz-badge tz-badge--danger"
										>{PROBLEM[r.descriptionCheck.problem]}</span
									>{/if}
							</div>
						</td>
						<td
							><a class="tz-btn tz-btn--outline tz-btn--sm" href={r.edit}
								><Icon name="pencil" /> Aanpassen</a
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<section class="adm-stack" aria-labelledby="redirects-title">
	<h2 class="t-h4" id="redirects-title">Doorverwijzingen</h2>
	<p class="adm-muted">
		Stuurt bezoekers van een oud adres naar een nieuw. Een gewijzigde slug maakt er automatisch een.
		Gebruik 301 voor een blijvende verhuizing, 302 voor een tijdelijke.
	</p>

	<form method="post" action="?/add" class="adm-card" use:enhance={saving((b) => (busy = b))}>
		<h3 class="t-h5">Nieuwe doorverwijzing</h3>
		<div class="adm-two">
			<FormField
				label="Oud adres"
				name="from_path"
				id="r-from"
				required
				bind:value={fromPath}
				placeholder="/oude-pagina"
				error={errors.from_path}
			/>
			<FormField
				label="Nieuw adres"
				name="to_path"
				id="r-to"
				required
				bind:value={toPath}
				placeholder="/realisaties"
				error={errors.to_path}
			/>
		</div>
		<div class="adm-two">
			<div class={['tz-field', errors.status && 'tz-field--error']}>
				<label class="tz-label" for="r-status">Soort</label>
				<div class="tz-select-wrap">
					<select class="tz-select" id="r-status" name="status" bind:value={status}>
						<option value="301">301, blijvend</option>
						<option value="302">302, tijdelijk</option>
					</select><Icon name="chevron-down" />
				</div>
				{#if errors.status}<span class="tz-msg tz-msg--error"
						><Icon name="circle-x" /> {errors.status}</span
					>{/if}
			</div>
			<FormField
				label="Notitie"
				name="note"
				id="r-note"
				optional
				bind:value={note}
				placeholder="Bijvoorbeeld: oude WordPress-pagina"
			/>
		</div>
		<div class="adm-actions">
			<button class={['tz-btn tz-btn--sm', busy && 'is-loading']} type="submit" disabled={busy}
				>{#if busy}<Icon name="loader-circle" class="tz-spin" />{:else}<Icon
						name="plus"
					/>{/if}<span class="tz-btn__label">Toevoegen</span></button
			>
		</div>
	</form>

	{#if data.redirects.length}
		<ul class="adm-list">
			{#each data.redirects as r (r.id)}
				<li class="adm-row redirect-row">
					<div class="redirect-row__main">
						<div class="redirect-row__paths">
							<code>{r.from}</code>
							<Icon name="arrow-right" /> <code>{r.to}</code>
						</div>
						<div class="adm-row__meta">
							{r.status === 301 ? '301, blijvend' : '302, tijdelijk'}{r.note ? ` · ${r.note}` : ''}
						</div>
					</div>
					<ConfirmDialog item={r.from} fields={{ id: r.id }} />
				</li>
			{/each}
		</ul>
	{:else}
		<p class="adm-muted">Nog geen doorverwijzingen.</p>
	{/if}
</section>

<style>
	.seo-table {
		min-width: 760px;
	}
	.seo-table td:nth-child(2) {
		width: 28%;
	}
	.seo-table td:nth-child(3) {
		width: 40%;
	}
	.seo-name {
		font-weight: 700;
		color: var(--heading);
	}
	.seo-count {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		align-items: center;
		margin-top: 4px;
	}
	.redirect-row {
		flex-wrap: wrap;
	}
	.redirect-row__main {
		flex: 1 1 220px;
		min-width: 0;
		display: grid;
		gap: 2px;
	}
	.redirect-row__paths {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		font-weight: 600;
		color: var(--heading);
		overflow-wrap: anywhere;
	}
	.redirect-row__paths code {
		overflow-wrap: anywhere;
	}
</style>
