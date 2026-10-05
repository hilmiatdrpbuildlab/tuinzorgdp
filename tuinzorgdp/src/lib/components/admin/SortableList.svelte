<script lang="ts" module>
	export type ListItem = {
		id: string;
		title: string;
		meta?: string;
		thumb?: string | null;
		badge?: { text: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'default' } | null;
	};
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/icons/Icon.svelte';
	import { toast } from '$lib/components/toast.svelte';

	/** A list of rows linking to their editor; dragging (or the arrows) sets the order. */
	let {
		items,
		base,
		orderable = true,
		empty = 'Nog niets toegevoegd.'
	}: { items: ListItem[]; base: string; orderable?: boolean; empty?: string } = $props();

	// A local copy that the drag reorders; it resets when the page data changes.
	let list = $derived([...items]);
	let dragging = $state<number | null>(null);
	let dirty = $state(false);

	function move(from: number, to: number) {
		if (to < 0 || to >= list.length || from === to) return;
		const next = [...list];
		const [x] = next.splice(from, 1);
		next.splice(to, 0, x);
		list = next;
		dirty = true;
	}
</script>

{#if list.length}
	<ul class="adm-list">
		{#each list as item, i (item.id)}
			<li
				class="adm-row"
				class:is-dragging={dragging === i}
				draggable={orderable ? 'true' : undefined}
				ondragstart={() => (dragging = i)}
				ondragover={(e) => orderable && e.preventDefault()}
				ondrop={() => {
					if (dragging !== null) move(dragging, i);
					dragging = null;
				}}
				ondragend={() => (dragging = null)}
			>
				{#if item.thumb !== undefined}
					{#if item.thumb}<img
							src={item.thumb}
							alt=""
							width="56"
							height="56"
							loading="lazy"
						/>{:else}<span class="adm-thumb"></span>{/if}
				{/if}
				<a class="adm-row__main" href="{base}/{item.id}">
					<span class="adm-row__title">{item.title}</span>
					{#if item.meta}<span class="adm-row__meta">{item.meta}</span>{/if}
				</a>
				{#if item.badge}
					<span
						class="tz-badge {item.badge.tone !== 'default' ? `tz-badge--${item.badge.tone}` : ''}"
						>{#if item.badge.tone !== 'default'}<span class="tz-badge__dot"></span>{/if}{item.badge
							.text}</span
					>
				{/if}
				{#if orderable}
					<button
						type="button"
						class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
						aria-label="Omhoog"
						disabled={i === 0}
						onclick={() => move(i, i - 1)}><Icon name="chevron-left" class="adm-rot90" /></button
					>
					<button
						type="button"
						class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
						aria-label="Omlaag"
						disabled={i === list.length - 1}
						onclick={() => move(i, i + 1)}><Icon name="chevron-right" class="adm-rot90" /></button
					>
				{/if}
			</li>
		{/each}
	</ul>
	{#if orderable && dirty}
		<form
			method="post"
			action="?/order"
			use:enhance={() =>
				async ({ update, result }) => {
					await update({ reset: false });
					if (result.type === 'success') {
						dirty = false;
						toast('Volgorde opgeslagen');
					}
				}}
		>
			<input type="hidden" name="ids" value={JSON.stringify(list.map((x) => x.id))} />
			<div class="adm-savebar">
				<span>De volgorde is gewijzigd.</span><button class="tz-btn tz-btn--sm" type="submit"
					>Volgorde opslaan</button
				>
			</div>
		</form>
	{/if}
{:else}
	<p class="adm-muted">{empty}</p>
{/if}
