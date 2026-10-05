<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let {
		busy = false,
		preview,
		children
	}: { busy?: boolean; preview?: string; children?: Snippet } = $props();
</script>

<div class="adm-savebar">
	<div class="adm-actions adm-actions--start">{@render children?.()}</div>
	<div class="adm-actions">
		{#if preview}<a
				class="tz-btn tz-btn--outline tz-btn--sm"
				href={preview}
				target="_blank"
				rel="noopener"><Icon name="eye" /> Preview</a
			>{/if}
		<button
			class={['tz-btn tz-btn--sm', busy && 'is-loading']}
			type="submit"
			formaction="?/save"
			disabled={busy}
			>{#if busy}<Icon name="loader-circle" class="tz-spin" />{/if}<span class="tz-btn__label"
				>Opslaan</span
			></button
		>
	</div>
</div>
