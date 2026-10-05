<script lang="ts" module>
	type TurnstileApi = {
		render: (el: HTMLElement, opts: Record<string, unknown>) => string;
		reset: (id: string) => void;
		remove: (id: string) => void;
	};

	let loading: Promise<TurnstileApi> | null = null;

	function load(): Promise<TurnstileApi> {
		loading ??= new Promise((resolve, reject) => {
			const w = window as unknown as { turnstile?: TurnstileApi };
			if (w.turnstile) return resolve(w.turnstile);
			const s = document.createElement('script');
			s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			s.async = true;
			s.onload = () =>
				w.turnstile ? resolve(w.turnstile) : reject(new Error('Turnstile ontbreekt'));
			s.onerror = () => reject(new Error('Turnstile kon niet laden'));
			document.head.appendChild(s);
		});
		return loading;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	/** Cloudflare Turnstile in invisible "managed" mode; it only shows itself when it needs to challenge. */
	// eslint-disable-next-line no-useless-assignment -- token is bound by the parent form
	let { siteKey, token = $bindable('') }: { siteKey: string; token?: string } = $props();

	let box: HTMLDivElement | undefined = $state();
	let widgetId: string | null = null;
	let api: TurnstileApi | null = null;

	export function reset() {
		token = '';
		if (api && widgetId) api.reset(widgetId);
	}

	onMount(() => {
		let cancelled = false;
		load()
			.then((t) => {
				if (cancelled || !box) return;
				api = t;
				widgetId = t.render(box, {
					sitekey: siteKey,
					appearance: 'interaction-only',
					language: 'nl',
					callback: (v: string) => (token = v),
					'expired-callback': () => (token = ''),
					'error-callback': () => (token = '')
				});
			})
			.catch(() => {});
		return () => {
			cancelled = true;
			if (api && widgetId) api.remove(widgetId);
		};
	});
</script>

<div bind:this={box} class="app-turnstile"></div>
