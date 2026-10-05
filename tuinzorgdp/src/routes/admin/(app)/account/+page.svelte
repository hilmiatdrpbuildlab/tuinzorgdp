<script lang="ts">
	import { enhance } from '$app/forms';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';

	let { data, form } = $props();
	let current = $state('');
	let next = $state('');
	let repeat = $state('');
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);

	// The typed passwords never stay on screen after a successful change.
	$effect(() => {
		if (form?.saved) {
			current = '';
			next = '';
			repeat = '';
		}
	});
</script>

<svelte:head><title>Account | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head"><h1>Account</h1></div>

<FormMessages {form} />

<div class="adm-card">
	<h2>Aangemeld als</h2>
	<p class="account-email">{data.email}</p>
	<form method="post" action="?/signout" class="adm-actions adm-actions--start">
		<button class="tz-btn tz-btn--outline tz-btn--sm" type="submit"
			><Icon name="arrow-right" /> Afmelden</button
		>
	</form>
</div>

<form method="post" action="?/password" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<h2>Wachtwoord wijzigen</h2>
		<p class="adm-muted">Na het wijzigen wordt u op alle andere toestellen afgemeld.</p>
		<FormField
			label="Huidig wachtwoord"
			name="current"
			id="f-current"
			type="password"
			autocomplete="current-password"
			required
			bind:value={current}
			error={errors.current}
		/>
		<FormField
			label="Nieuw wachtwoord"
			name="new"
			id="f-new"
			type="password"
			autocomplete="new-password"
			required
			minlength={data.minPassword}
			bind:value={next}
			hint={`Minstens ${data.minPassword} tekens. Een zin van een paar woorden is sterk en makkelijk te onthouden.`}
			error={errors.new}
		/>
		<FormField
			label="Herhaal het nieuwe wachtwoord"
			name="repeat"
			id="f-repeat"
			type="password"
			autocomplete="new-password"
			required
			bind:value={repeat}
			error={errors.repeat}
		/>
		<div class="adm-actions">
			<button class={['tz-btn tz-btn--sm', busy && 'is-loading']} type="submit" disabled={busy}
				>{#if busy}<Icon name="loader-circle" class="tz-spin" />{/if}<span class="tz-btn__label"
					>Wachtwoord wijzigen</span
				></button
			>
		</div>
	</div>
</form>

<style>
	.account-email {
		margin: 0;
		font-weight: 700;
		color: var(--heading);
		overflow-wrap: anywhere;
	}
</style>
