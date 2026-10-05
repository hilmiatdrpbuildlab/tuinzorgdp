<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { dismiss, toasts } from './toast.svelte';
</script>

<div class="tz-toasts" aria-live="polite">
	{#each toasts as t (t.id)}
		<div class="tz-toast">
			<Icon name={t.icon} />
			<span class="tz-toast__text">{t.text}</span>
			<button
				class="tz-alert__close"
				type="button"
				aria-label="Sluiten"
				onclick={() => dismiss(t.id)}><Icon name="x" /></button
			>
		</div>
	{/each}
</div>
