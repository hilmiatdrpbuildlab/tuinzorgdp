<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { AdminMedia } from '$lib/client/upload';
	import MediaPicker from './MediaPicker.svelte';

	/** One photo field: a hidden input with the media id, a preview, and choose / upload / remove. */
	let {
		label,
		name,
		media = $bindable(null),
		hint
	}: { label: string; name: string; media?: AdminMedia | null; hint?: string } = $props();

	let picker: MediaPicker | undefined = $state();
</script>

<div class="tz-field adm-image">
	<span class="tz-label">{label}</span>
	<input type="hidden" {name} value={media?.id ?? ''} />
	{#if media}
		<div class="adm-image__preview">
			<img src={media.src} alt={media.alt} width={media.width} height={media.height} />
			{#if !media.alt}<span class="tz-badge tz-badge--warning"
					><span class="tz-badge__dot"></span>Alt-tekst ontbreekt</span
				>{/if}
		</div>
	{:else}
		<div class="tz-media tz-media--4x3 adm-image__empty">
			<div class="tz-media__empty">
				<Icon name="image-plus" /><span class="tz-media__field">Nog geen foto</span>
			</div>
		</div>
	{/if}
	<div class="adm-actions adm-actions--start">
		<button
			type="button"
			class="tz-btn tz-btn--outline tz-btn--sm"
			onclick={() => picker?.open('library')}><Icon name="image" /> Kiezen</button
		>
		<button
			type="button"
			class="tz-btn tz-btn--outline tz-btn--sm"
			onclick={() => picker?.open('upload')}><Icon name="upload" /> Nieuwe foto</button
		>
		{#if media}<button
				type="button"
				class="tz-btn tz-btn--ghost tz-btn--sm"
				onclick={() => (media = null)}><Icon name="x" /> Weghalen</button
			>{/if}
	</div>
	{#if hint}<span class="tz-hint">{hint}</span>{/if}
</div>

<MediaPicker bind:this={picker} onpick={(list) => (media = list[0] ?? media)} />
