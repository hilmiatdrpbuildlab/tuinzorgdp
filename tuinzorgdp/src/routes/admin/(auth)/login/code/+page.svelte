<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { data, form } = $props();
	// Seeds the countdown.
	// svelte-ignore state_referenced_locally
	let wait = $state(data.resendIn);

	onMount(() => {
		const t = setInterval(() => (wait = Math.max(0, wait - 1)), 1000);
		return () => clearInterval(t);
	});
	$effect(() => {
		if (form && 'resent' in form && form.resent) wait = 60;
	});
</script>

<svelte:head><title>Code invullen | TuinZorg DP beheer</title></svelte:head>

<h1 class="t-h3">Code invullen</h1>
<p class="adm-muted">
	We stuurden een code van 6 cijfers naar uw e-mailadres. Ze is 5 minuten geldig.
</p>

{#if form && 'message' in form && form.message}
	<div class="tz-alert tz-alert--danger" role="alert">
		<Icon name="circle-x" />
		<div class="tz-alert__text">{form.message}</div>
	</div>
{:else if form && 'resent' in form}
	<div class="tz-alert tz-alert--success" role="status">
		<Icon name="circle-check" />
		<div class="tz-alert__text">Er is een nieuwe code verstuurd.</div>
	</div>
{/if}

<form method="post" action="?/verify" class="adm-stack" use:enhance>
	<div class="tz-field">
		<label class="tz-label" for="code">Code</label>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			class="tz-input adm-code"
			id="code"
			name="code"
			inputmode="numeric"
			autocomplete="one-time-code"
			maxlength="6"
			pattern={'[0-9]{6}'}
			required
			autofocus
		/>
	</div>
	<label class="tz-check"
		><input type="checkbox" name="trust" checked />
		<span>Dit toestel 30 dagen vertrouwen</span></label
	>
	<button class="tz-btn tz-btn--block" type="submit">Aanmelden</button>
</form>

<form method="post" action="?/resend" use:enhance>
	<button class="tz-btn tz-btn--ghost tz-btn--block" type="submit" disabled={wait > 0}>
		{wait > 0 ? `Code opnieuw sturen (${wait} s)` : 'Code opnieuw sturen'}
	</button>
</form>
<a class="tz-textlink" href="/admin/login">Ander account <Icon name="arrow-right" /></a>
