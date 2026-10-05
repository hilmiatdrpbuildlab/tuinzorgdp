<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { Guard } from '$lib/rules';

	/** Publishing guards, shown inline before the client tries to publish. */
	let { guards }: { guards: Guard[] } = $props();
</script>

{#if guards.length}
	<div class="tz-alert tz-alert--warning" role="status">
		<Icon name="triangle-alert" />
		<div>
			<div class="tz-alert__title">Nog niet klaar om te publiceren</div>
			<ul class="adm-guards">
				{#each guards as g, i (i)}<li>{g.message}</li>{/each}
			</ul>
		</div>
	</div>
{/if}
