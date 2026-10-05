<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { Guard } from '$lib/rules';
	import GuardList from './GuardList.svelte';

	let {
		form
	}: { form: { message?: string; guards?: Guard[]; saved?: boolean } | null | undefined } =
		$props();
</script>

{#if form?.message}
	<div class="tz-alert tz-alert--danger" role="alert">
		<Icon name="circle-x" />
		<div>
			<div class="tz-alert__title">Niet opgeslagen</div>
			<div class="tz-alert__text">{form.message}</div>
		</div>
	</div>
{/if}
{#if form?.guards?.length}<GuardList guards={form.guards} />{/if}
