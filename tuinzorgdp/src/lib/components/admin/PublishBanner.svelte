<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';

	type Active = { id: string; triggeredAt: string } | null;

	/**
	 * Save is not publish: this banner counts the changes that are not live yet. Publiceren starts a
	 * build; the banner then polls the live /build-info.json and only says Live once it sees this
	 * publish there. No new version after 15 minutes means Mislukt; the changes stay counted.
	 */
	let {
		count,
		active,
		lastFailed
	}: { count: number; active: Active; lastFailed: { detail: string | null } | null } = $props();

	let phase = $state<'idle' | 'building' | 'live' | 'failed'>('idle');
	let message = $state<string | null>(null);
	let timer: ReturnType<typeof setInterval> | null = null;
	const TIMEOUT = 15 * 60 * 1000;

	function stop() {
		if (timer) clearInterval(timer);
		timer = null;
	}

	function watch(build: { id: string; triggeredAt: string }) {
		stop();
		phase = 'building';
		const started = new Date(build.triggeredAt).getTime();
		const tick = async () => {
			try {
				const res = await fetch(`/build-info.json?t=${Date.now()}`, { cache: 'no-store' });
				const info = res.ok ? ((await res.json()) as { publishId?: string | null }) : null;
				if (info?.publishId === build.id) {
					stop();
					await fetch('/admin/api/publish', {
						method: 'PATCH',
						body: JSON.stringify({ id: build.id }),
						headers: { 'content-type': 'application/json' }
					});
					phase = 'live';
					await invalidateAll();
					return;
				}
			} catch {
				/* keep polling */
			}
			if (Date.now() - started > TIMEOUT) {
				stop();
				phase = 'failed';
				message =
					'Geen nieuwe versie live na 15 minuten. Uw wijzigingen zijn bewaard; probeer opnieuw of bekijk het buildlog.';
				await invalidateAll();
			}
		};
		timer = setInterval(tick, 10_000);
		tick();
	}

	async function publish() {
		message = null;
		phase = 'building';
		const res = await fetch('/admin/api/publish', { method: 'POST' });
		const body = (await res.json().catch(() => null)) as {
			build?: { id: string; triggeredAt: string; status: string; detail?: string };
		} | null;
		if (!res.ok || !body?.build || body.build.status === 'failed') {
			phase = 'failed';
			message = body?.build?.detail ?? 'Publiceren kon niet starten.';
			return;
		}
		watch(body.build);
	}

	onMount(() => {
		if (active) watch(active);
		else if (lastFailed) {
			phase = 'failed';
			message = lastFailed.detail;
		}
	});
	onDestroy(stop);
</script>

<div class={['adm-publish', `adm-publish--${phase}`]} role="status" aria-live="polite">
	<div class="adm-publish__text">
		{#if phase === 'building'}
			<Icon name="loader-circle" class="tz-spin" /> <strong>Bezig met publiceren</strong>
			<span class="adm-muted">Dit duurt meestal enkele minuten. U kunt verder werken.</span>
		{:else if phase === 'live'}
			<Icon name="circle-check" /> <strong>Live</strong>
			<span class="adm-muted">De nieuwe versie staat online.</span>
		{:else if phase === 'failed'}
			<Icon name="circle-x" /> <strong>Mislukt</strong>
			<span class="adm-muted">{message ?? ''}</span>
		{:else if count > 0}
			<Icon name="info" />
			<strong>{count} {count === 1 ? 'wijziging' : 'wijzigingen'} nog niet online</strong>
			<span class="adm-muted">Opslaan bewaart; Publiceren zet het op de website.</span>
		{:else}
			<Icon name="circle-check" /> <span>Alles staat online.</span>
		{/if}
	</div>
	<button
		type="button"
		class="tz-btn tz-btn--sm"
		disabled={phase === 'building' || (count === 0 && phase !== 'failed')}
		onclick={publish}
	>
		Publiceren
	</button>
</div>
