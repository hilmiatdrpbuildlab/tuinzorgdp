<script lang="ts">
	import '$lib/components/admin/admin.css';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="adm-login">
	<div class="adm-login__card">
		<img src="/logo/tz-logo.svg" alt="TuinZorg DP" width="176" height="40" />
		{@render children()}
	</div>
</div>
