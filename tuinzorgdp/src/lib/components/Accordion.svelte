<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	let { items, open = 0 }: { items: { question: string; answer: string }[]; open?: number | null } =
		$props();
</script>

<div class="tz-accordion">
	{#each items as item, i (item.question)}
		<details open={i === open}>
			<summary>{item.question} <span class="tz-icon-chip"><Icon name="plus" /></span></summary>
			<div class="tz-accordion__body">{item.answer}</div>
		</details>
	{/each}
</div>
