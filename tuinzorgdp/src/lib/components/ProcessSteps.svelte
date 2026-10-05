<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';
	import SectionHeader from './SectionHeader.svelte';

	// The four steps of the current site; fixed in code, not a table (docs/cms-plan/03-database.md).
	const STEPS: { icon: IconName; title: string; text: string }[] = [
		{
			icon: 'phone',
			title: 'Contact opnemen',
			text: 'U belt, mailt of vult het formulier in voor een vraag of een offerte.'
		},
		{
			icon: 'message-circle',
			title: 'Advies en bespreking',
			text: 'Wij bespreken uw wensen ter plaatse en geven eerlijk, passend advies.'
		},
		{
			icon: 'shovel',
			title: 'Uitvoering',
			text: 'Vakkundig en netjes uitgevoerd, op het afgesproken moment.'
		},
		{
			icon: 'circle-check',
			title: 'Oplevering',
			text: 'Alles wordt gecontroleerd en de tuin netjes achtergelaten.'
		}
	];
</script>

<section class="tz-section" data-theme="forest" id="werkwijze" aria-labelledby="werk-title">
	<div class="tz-container">
		<SectionHeader
			eyebrow="Werkwijze"
			title="In vier stappen naar een verzorgde tuin"
			accentWord="verzorgde tuin"
			align="center"
			id="werk-title"
		/>
		<ol class="tz-steps">
			{#each STEPS as step (step.title)}
				<li class="tz-step">
					<div class="tz-step__head">
						<span class="tz-step__num"></span><span class="tz-icon-chip"
							><Icon name={step.icon} /></span
						>
					</div>
					<h3 class="t-h4">{step.title}</h3>
					<p>{step.text}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>
