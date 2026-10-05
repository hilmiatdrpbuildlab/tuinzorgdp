<script lang="ts">
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
	title="Pagina niet gevonden | TuinZorg DP"
	description="Deze pagina bestaat niet (meer). Kies een van de pagina's hieronder."
	noindex
/>

<section class="tz-section">
	<div class="tz-container tz-stack">
		<SectionHeader
			eyebrow="404"
			title="Deze pagina bestaat niet (meer)"
			accentWord="niet"
			lead="Misschien vindt u wat u zoekt via een van deze pagina's."
			level={1}
		/>
		<div class="app-links">
			<a class="tz-btn" href="/">Home</a>
			<a class="tz-btn tz-btn--outline" href="/diensten">Diensten</a>
			<a class="tz-btn tz-btn--outline" href="/realisaties">Realisaties</a>
			<a class="tz-btn tz-btn--outline" href="/contact">Contact</a>
		</div>
	</div>
</section>
