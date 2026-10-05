<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import { toast } from '$lib/components/toast.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data, form } = $props();
	let picker: ReturnType<typeof MediaPicker> | undefined = $state();
	let busy = $state<string | null>(null);

	const FILTERS = [
		{ key: 'all', label: 'Alle', href: '/admin/media' },
		{ key: 'alt', label: 'Zonder alt-tekst', href: '/admin/media?filter=alt' },
		{ key: 'unused', label: 'Niet gebruikt', href: '/admin/media?filter=unused' }
	] as const;

	const kb = (bytes: number) =>
		bytes >= 1024 * 1024
			? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
			: `${Math.round(bytes / 1024)} kB`;

	/** Inline alt text: stays in place (no scroll to the top like the editors), toast on success. */
	const saveAlt =
		(id: string): SubmitFunction =>
		() => {
			busy = id;
			return async ({ result, update }) => {
				await update({ reset: false });
				busy = null;
				if (result.type === 'success') toast('Alt-tekst opgeslagen');
				if (result.type === 'failure') window.scrollTo({ top: 0, behavior: 'smooth' });
			};
		};
</script>

<svelte:head><title>Media | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head">
	<h1>Media</h1>
	<button class="tz-btn tz-btn--sm" type="button" onclick={() => picker?.open('upload')}
		><Icon name="upload" /> Opladen</button
	>
</div>
<p class="adm-muted">
	Alle foto's van de website. Een foto die nog gebruikt wordt, kan niet verwijderd worden. Foto's
	die 24 uur nergens gebruikt worden, verdwijnen vanzelf.
</p>

<FormMessages {form} />

<nav class="adm-filters" aria-label="Filter">
	{#each FILTERS as f (f.key)}
		<a class="tz-tag" href={f.href} aria-current={data.filter === f.key ? 'page' : undefined}
			>{f.label} <span class="tz-tag__count">{data.counts[f.key]}</span></a
		>
	{/each}
</nav>

{#if data.items.length}
	<ul class="media-grid">
		{#each data.items as m (m.id)}
			<li class="media-card">
				<a class="media-card__img" href={m.src} target="_blank" rel="noopener"
					><img src={m.src} alt={m.alt} loading="lazy" width={m.width} height={m.height} /></a
				>
				<div class="media-card__body">
					<div class="media-card__name" title={m.fileName}>{m.fileName}</div>
					<div class="adm-muted">{m.width} × {m.height} px · {kb(m.bytes)}</div>

					<form method="post" action="?/alt" class="media-card__alt" use:enhance={saveAlt(m.id)}>
						<input type="hidden" name="id" value={m.id} />
						<label class="tz-label" for="alt-{m.id}">Alt-tekst</label>
						<div class="media-card__row">
							<input
								class={['tz-input', !m.alt.trim() && 'adm-input--warn']}
								id="alt-{m.id}"
								name="alt"
								value={m.alt}
								maxlength="300"
								placeholder="Beschrijf wat u ziet"
							/>
							<button
								class={['tz-btn tz-btn--sm tz-btn--outline', busy === m.id && 'is-loading']}
								type="submit"
								disabled={busy === m.id}
								>{#if busy === m.id}<Icon name="loader-circle" class="tz-spin" />{/if}<span
									class="tz-btn__label">Opslaan</span
								></button
							>
						</div>
					</form>

					{#if m.usages.length}
						<div>
							<span class="tz-label">Gebruikt in</span>
							<ul class="media-card__uses">
								{#each m.usages as u, i (i)}
									<li>
										{#if u.href}<a href={u.href}>{u.label}</a>{:else}{u.label}{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
					<div class="adm-actions adm-actions--start">
						{#if m.usages.length}
							<span class="tz-badge tz-badge--success"
								><span class="tz-badge__dot"></span>In gebruik</span
							>
						{:else}
							<span class="tz-badge"><span class="tz-badge__dot"></span>Niet gebruikt</span>
						{/if}
						<ConfirmDialog
							item={m.fileName}
							fields={{ id: m.id }}
							extra="Een foto die nog gebruikt wordt, kan niet verwijderd worden."
						/>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="adm-muted">
		{data.filter === 'alt'
			? 'Elke foto heeft een alt-tekst.'
			: data.filter === 'unused'
				? 'Elke foto wordt gebruikt.'
				: "Nog geen foto's. Kies Opladen om er een toe te voegen."}
	</p>
{/if}

<MediaPicker bind:this={picker} multiple onpick={() => invalidateAll()} />

<style>
	.tz-tag {
		text-decoration: none;
	}
	.tz-tag[aria-current='page'] {
		background: var(--heading);
		border-color: var(--heading);
		color: var(--bg);
	}
	.media-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-md);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
	}
	.media-card {
		display: grid;
		grid-template-rows: auto 1fr;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		overflow: hidden;
		min-width: 0;
	}
	.media-card__img {
		display: block;
		aspect-ratio: 4 / 3;
		background: var(--surface-sunken);
	}
	.media-card__img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.media-card__body {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md) var(--space-md);
		align-content: start;
		min-width: 0;
	}
	.media-card__name {
		font-weight: 700;
		color: var(--heading);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.media-card__alt {
		display: grid;
		gap: 4px;
	}
	.media-card__row {
		display: flex;
		gap: var(--space-2xs, 4px);
	}
	.media-card__row .tz-input {
		flex: 1;
		min-width: 0;
	}
	.media-card__uses {
		margin: 2px 0 0;
		padding-left: 1.2em;
		font-size: 14px;
		overflow-wrap: anywhere;
	}
</style>
