<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	/** Google Maps loads only after a click, so no Google cookie is set before the visitor asks for it. */
	let { src, class: className = '' }: { src: string; class?: string } = $props();
	let loaded = $state(false);
</script>

<div class={['tz-media tz-media--16x9 tz-media--lg', className]}>
	{#if loaded}
		<iframe
			{src}
			title="Kaart met de ligging van TuinZorg DP"
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
			class="app-map-frame"
		></iframe>
	{:else}
		<div class="tz-media__empty">
			<Icon name="map-pin" />
			<button class="tz-btn tz-btn--sm" type="button" onclick={() => (loaded = true)}
				>Kaart laden</button
			>
			<span class="tz-media__field">Google Maps laadt pas na uw klik.</span>
		</div>
	{/if}
</div>
