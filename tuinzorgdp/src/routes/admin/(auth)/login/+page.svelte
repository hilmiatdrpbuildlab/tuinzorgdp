<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/icons/Icon.svelte';

	let { form } = $props();
	let busy = $state(false);
</script>

<svelte:head><title>Aanmelden | TuinZorg DP beheer</title></svelte:head>

<h1 class="t-h3">Aanmelden</h1>
<p class="adm-muted">Beheer van tuinzorgdp.be. Na uw wachtwoord krijgt u een code per e-mail.</p>

{#if form?.message}
	<div class="tz-alert tz-alert--danger" role="alert">
		<Icon name="circle-x" />
		<div class="tz-alert__text">{form.message}</div>
	</div>
{/if}

<form
	method="post"
	class="adm-stack"
	use:enhance={() => {
		busy = true;
		return async ({ update }) => {
			await update();
			busy = false;
		};
	}}
>
	<div class="tz-field">
		<label class="tz-label" for="email">E-mailadres</label>
		<input
			class="tz-input"
			id="email"
			name="email"
			type="email"
			autocomplete="username"
			required
			value={form?.email ?? ''}
		/>
	</div>
	<div class="tz-field">
		<label class="tz-label" for="password">Wachtwoord</label>
		<input
			class="tz-input"
			id="password"
			name="password"
			type="password"
			autocomplete="current-password"
			required
		/>
	</div>
	<button class={['tz-btn tz-btn--block', busy && 'is-loading']} type="submit" disabled={busy}
		>{#if busy}<Icon name="loader-circle" class="tz-spin" />{/if}<span class="tz-btn__label"
			>Verder</span
		></button
	>
	<p class="tz-hint">Wachtwoord vergeten? Vraag DRP BuildLab om het opnieuw in te stellen.</p>
</form>
