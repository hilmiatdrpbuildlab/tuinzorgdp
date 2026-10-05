<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Pagina niet gevonden' : 'Er ging iets mis'} | TuinZorg DP</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="tz-section">
	<div class="tz-container tz-stack app-center">
		<a href="/"><img src="/logo/tz-logo.svg" alt="TuinZorg DP" width="193" height="44" /></a>
		<h1 class="t-h1">
			{page.status === 404 ? 'Deze pagina bestaat niet (meer)' : 'Er ging iets mis'}
		</h1>
		<p class="t-lead">Misschien vindt u wat u zoekt via een van deze pagina's.</p>
		<div class="app-links">
			<a class="tz-btn" href="/">Home</a>
			<a class="tz-btn tz-btn--outline" href="/diensten">Diensten</a>
			<a class="tz-btn tz-btn--outline" href="/realisaties">Realisaties</a>
			<a class="tz-btn tz-btn--outline" href="/contact">Contact</a>
		</div>
	</div>
</main>
