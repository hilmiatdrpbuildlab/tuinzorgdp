<script lang="ts">
	import CTABand from '$lib/components/CTABand.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import ProcessSteps from '$lib/components/ProcessSteps.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ServiceGrid from '$lib/components/ServiceGrid.svelte';

	let { data } = $props();
</script>

<Seo title={data.page.title} description={data.page.description} schema={data.schema} />

<section class="tz-section tz-bg-surface" aria-labelledby="diensten-title">
	<div class="tz-container">
		<SectionHeader
			eyebrow="Onze diensten"
			title={data.page.heading}
			accentWord="verzorgde"
			lead={data.page.intro}
			level={1}
			id="diensten-title"
		/>
		<ServiceGrid services={data.services} level={2} />
	</div>
</section>

<ProcessSteps />

<section class="tz-section">
	<div class="tz-container">
		<CTABand
			title={data.cta.title}
			accentWord={data.cta.accentWord}
			lead={data.cta.lead}
			phone={data.settings.company.phone}
		/>
	</div>
</section>

<ContactSection
	settings={data.settings}
	tiles={data.tiles}
	photo={data.contactMedia}
	areaLabel={data.areaLabel}
	turnstileSiteKey={data.site.turnstileSiteKey}
/>
