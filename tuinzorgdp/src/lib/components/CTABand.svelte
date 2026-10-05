<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { shortPhone, telHref } from '$lib/format';
	import AccentTitle from './AccentTitle.svelte';

	let {
		title,
		accentWord,
		lead,
		phone,
		quoteHref = '#offerte'
	}: {
		title: string;
		accentWord?: string | null;
		lead: string;
		phone?: string;
		quoteHref?: string;
	} = $props();
</script>

<div class="tz-cta" data-theme="forest">
	<div class="tz-stack">
		<AccentTitle {title} {accentWord} class="t-h2" />
		<p class="t-lead">{lead}</p>
	</div>
	<div class="tz-cta__actions">
		<a class="tz-btn tz-btn--lg" href={quoteHref}
			>Offerte aanvragen <span class="tz-btn__chip"><Icon name="arrow-right" /></span></a
		>
		{#if phone}<a class="tz-btn tz-btn--lg tz-btn--outline" href={telHref(phone)}
				><Icon name="phone" /> {shortPhone(phone)}</a
			>{/if}
	</div>
</div>
