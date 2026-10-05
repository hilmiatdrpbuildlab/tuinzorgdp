<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	let {
		rating = 5,
		lg = false,
		label
	}: { rating?: number; lg?: boolean; label?: string } = $props();
	const full = $derived(Math.round(rating));
</script>

<span
	class={['tz-stars', lg && 'tz-stars--lg']}
	role="img"
	aria-label={label ?? `${full} op 5 sterren`}
>
	{#each [1, 2, 3, 4, 5] as n (n)}<Icon
			name="star"
			class={n <= full ? '' : 'app-star-off'}
		/>{/each}
</span>
