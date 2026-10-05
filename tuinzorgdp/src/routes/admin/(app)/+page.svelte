<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { formatDateTime } from '$lib/format';

	let { data } = $props();

	const STATUS: Record<string, string> = {
		pending: 'In wachtrij',
		building: 'Bezig',
		live: 'Live',
		failed: 'Mislukt'
	};
	const TONE: Record<string, string> = {
		pending: 'info',
		building: 'info',
		live: 'success',
		failed: 'danger'
	};
</script>

<svelte:head><title>Overzicht | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head"><h1>Overzicht</h1></div>

<div class="adm-grid">
	<a class="adm-card" href="/admin/aanvragen" style="text-decoration:none">
		<div class="adm-stat"><strong>{data.newRequests}</strong><span>nieuwe aanvragen</span></div>
	</a>
	<div class="adm-card">
		<div class="adm-stat">
			<strong>{data.changeCount}</strong><span>wijzigingen nog niet online</span>
		</div>
	</div>
	<div class="adm-card">
		<div class="adm-stat">
			<strong>{data.builds[0] ? STATUS[data.builds[0].status] : '–'}</strong>
			<span>laatste publicatie{data.builds[0] ? `, ${formatDateTime(data.builds[0].at)}` : ''}</span
			>
		</div>
	</div>
</div>

{#if data.gaps.length}
	<section class="adm-card" aria-labelledby="gaps">
		<h2 id="gaps">Nog aan te vullen</h2>
		<ul class="adm-list">
			{#each data.gaps as g (g.label)}
				<li class="adm-row">
					<span class="tz-badge tz-badge--warning"
						><span class="tz-badge__dot"></span>{g.count}</span
					>
					<a class="adm-row__main" href={g.href}><span class="adm-row__title">{g.label}</span></a>
					<Icon name="chevron-right" />
				</li>
			{/each}
		</ul>
	</section>
{/if}

<div class="adm-two">
	<section class="adm-card" aria-labelledby="new-req">
		<h2 id="new-req">Nieuwe aanvragen</h2>
		{#if data.requests.length}
			<ul class="adm-list">
				{#each data.requests as r (r.id)}
					<li class="adm-row adm-row__new">
						<a class="adm-row__main" href="/admin/aanvragen/{r.id}">
							<span class="adm-row__title"
								>{r.kind === 'offerte' ? 'Offerte' : 'Vraag'} · {r.name}</span
							>
							<span class="adm-row__meta">{r.municipality ?? ''} {formatDateTime(r.at)}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="adm-muted">Geen nieuwe aanvragen.</p>
		{/if}
	</section>
	<section class="adm-card" aria-labelledby="changes">
		<h2 id="changes">Nog niet gepubliceerd</h2>
		{#if data.changes.length}
			<ul class="adm-list">
				{#each data.changes as c, i (i)}
					<li class="adm-row">
						<span class="adm-row__main"
							><span class="adm-row__title">{c.label}</span><span class="adm-row__meta"
								>{c.table} · {c.action} · {formatDateTime(c.at)}</span
							></span
						>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="adm-muted">Alles staat online.</p>
		{/if}
	</section>
</div>

{#if data.builds.length}
	<section class="adm-card" aria-labelledby="builds">
		<h2 id="builds">Publicaties</h2>
		<ul class="adm-list">
			{#each data.builds as b, i (i)}
				<li class="adm-row">
					<span class="tz-badge tz-badge--{TONE[b.status]}"
						><span class="tz-badge__dot"></span>{STATUS[b.status]}</span
					>
					<span class="adm-row__main"
						><span class="adm-row__title">{formatDateTime(b.at)}</span><span class="adm-row__meta"
							>{b.trigger === 'cms'
								? 'Via Publiceren'
								: b.trigger === 'cron'
									? 'Google-score bijgewerkt'
									: 'Code-update'}{b.detail ? ` · ${b.detail}` : ''}</span
						></span
					>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<details class="adm-panel">
	<summary>Korte handleiding</summary>
	<div class="adm-stack">
		<p>
			<strong>Opslaan of publiceren.</strong> Opslaan bewaart uw wijziging, maar de website
			verandert nog niet. Met <strong>Publiceren</strong> bovenaan zet u alle bewaarde wijzigingen
			in één keer online. Dat duurt enkele minuten; daarna staat er <em>Live</em>.
		</p>
		<p>
			<strong>Een realisatie toevoegen vanaf uw gsm.</strong> Ga naar Realisaties, kies Nieuwe realisatie,
			geef een titel en de dienst, en laad uw foto's op. Duid per foto aan of het een voor- of na-foto
			is. Zet Gepubliceerd aan en kies Publiceren.
		</p>
		<p>
			<strong>Een aanvraag beantwoorden.</strong> In Aanvragen ziet u alles wat de klant invulde, met
			de foto's van de tuin. Bel, mail of stuur een WhatsApp met de knoppen, en zet de status op Beantwoord
			of Gepland.
		</p>
		<p>
			<strong>Waarom alt-tekst?</strong> Een korte beschrijving van wat op de foto staat helpt blinde
			bezoekers en Google. Zonder alt-tekst kan een foto niet gepubliceerd worden.
		</p>
	</div>
</details>
