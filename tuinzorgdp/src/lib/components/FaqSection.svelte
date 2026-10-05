<script lang="ts">
	import type { Faq } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import Accordion from './Accordion.svelte';

	let {
		faqs,
		title = 'Goed om te weten',
		linkHref = '#contact'
	}: { faqs: Faq[]; title?: string; linkHref?: string } = $props();
</script>

{#if faqs.length}
	<section class="tz-section tz-bg-surface" id="faq" aria-labelledby="faq-title">
		<div class="tz-container tz-faq">
			<div class="tz-stack">
				<span class="tz-eyebrow tz-eyebrow--pill app-self-start"
					><span class="tz-leaf"></span>Veelgestelde vragen</span
				>
				<h2 class="t-h2" id="faq-title">{title}</h2>
				<p class="t-lead">Staat uw vraag er niet bij? Bel of stuur ons een bericht.</p>
				<div>
					<a class="tz-textlink" href={linkHref}>Stel uw vraag <Icon name="arrow-right" /></a>
				</div>
			</div>
			<Accordion items={faqs} open={0} />
		</div>
	</section>
{/if}
