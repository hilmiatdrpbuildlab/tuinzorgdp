<script lang="ts">
	import type { Service } from '$lib/content/types';
	import ServiceCard from './ServiceCard.svelte';

	let { services, level = 3 }: { services: Service[]; level?: 2 | 3 } = $props();
</script>

<div class="tz-services">
	{#each services as s (s.id)}
		<ServiceCard service={s} featured={s.featured} {level} />
	{/each}
</div>
