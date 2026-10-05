<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { formatDateTime } from '$lib/format';

	let { data } = $props();

	const STATUS_LABEL: Record<string, string> = {
		nieuw: 'Nieuw',
		beantwoord: 'Beantwoord',
		gepland: 'Gepland',
		archief: 'Archief'
	};
	const STATUS_TONE: Record<string, string> = {
		nieuw: 'info',
		beantwoord: 'success',
		gepland: 'warning',
		archief: 'outline'
	};

	function href(kind: string | null, status: string | null) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- builds a link, not state
		const p = new URLSearchParams();
		if (kind) p.set('soort', kind);
		if (status) p.set('status', status);
		const q = p.toString();
		return `/admin/aanvragen${q ? `?${q}` : ''}`;
	}
</script>

<svelte:head><title>Aanvragen | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>Aanvragen</h1>
	<a class="tz-btn tz-btn--outline tz-btn--sm" href="/admin/aanvragen/export.csv" download
		><Icon name="arrow-up-right" /> CSV-export</a
	>
</div>

<div class="adm-filters" role="group" aria-label="Soort">
	<a class="tz-tag" aria-current={!data.kind ? 'true' : undefined} href={href(null, data.status)}
		>Alles</a
	>
	<a
		class="tz-tag"
		aria-current={data.kind === 'offerte' ? 'true' : undefined}
		href={href('offerte', data.status)}>Offerte</a
	>
	<a
		class="tz-tag"
		aria-current={data.kind === 'vraag' ? 'true' : undefined}
		href={href('vraag', data.status)}>Vraag</a
	>
</div>
<div class="adm-filters" role="group" aria-label="Status">
	<a class="tz-tag" aria-current={!data.status ? 'true' : undefined} href={href(data.kind, null)}
		>Alle statussen</a
	>
	{#each Object.entries(STATUS_LABEL) as [value, label] (value)}
		<a
			class="tz-tag"
			aria-current={data.status === value ? 'true' : undefined}
			href={href(data.kind, value)}>{label}</a
		>
	{/each}
</div>

{#if data.requests.length}
	<ul class="adm-list">
		{#each data.requests as r (r.id)}
			<li class={['adm-row', r.status === 'nieuw' && 'adm-row__new']}>
				<a class="adm-row__main" href="/admin/aanvragen/{r.id}">
					<span class="adm-row__title"
						>{r.kind === 'offerte' ? 'Offerte' : 'Vraag'} · {r.name}{r.municipality
							? ` · ${r.municipality}`
							: ''}</span
					>
					<span class="adm-row__meta">{formatDateTime(r.createdAt)} · {r.preview}</span>
				</a>
				<span class="tz-badge tz-badge--{STATUS_TONE[r.status]}"
					>{#if r.status !== 'archief'}<span class="tz-badge__dot"></span>{/if}{STATUS_LABEL[
						r.status
					]}</span
				>
			</li>
		{/each}
	</ul>
{:else}
	<p class="adm-muted">Geen aanvragen{data.kind || data.status ? ' met deze filter' : ''}.</p>
{/if}

<p class="adm-muted">
	Aanvragen en hun foto's worden 12 maanden na ontvangst automatisch verwijderd. Wilt u ze bewaren,
	maak dan eerst een CSV-export.
</p>
