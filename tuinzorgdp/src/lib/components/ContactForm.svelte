<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { readForm, validate, type FieldErrors } from '$lib/forms';
	import { LIMITS } from '$lib/rules';
	import Alert from './Alert.svelte';
	import FormField from './FormField.svelte';
	import Turnstile from './Turnstile.svelte';

	let { turnstileSiteKey = null, phone }: { turnstileSiteKey?: string | null; phone?: string } =
		$props();

	const FIELD_ORDER = ['naam', 'email', 'telefoon', 'bericht'];

	let naam = $state('');
	let email = $state('');
	let telefoon = $state('');
	let bericht = $state('');
	let errors = $state<FieldErrors>({});
	let tried = $state(false);
	let submitting = $state(false);
	let done = $state(false);
	let failure = $state<string | null>(null);
	let token = $state('');
	let enhanced = $state(false);

	let form: HTMLFormElement | undefined = $state();
	let success: HTMLDivElement | undefined = $state();
	let turnstile: Turnstile | undefined = $state();

	onMount(() => (enhanced = true));

	function current() {
		const fd = new FormData();
		fd.set('naam', naam);
		fd.set('email', email);
		fd.set('telefoon', telefoon);
		fd.set('bericht', bericht);
		return fd;
	}

	function check(): FieldErrors {
		const r = validate('vraag', readForm(current(), 'vraag'));
		return r.ok ? {} : { ...r.errors };
	}

	$effect(() => {
		if (!tried) return;
		const next = check();
		for (const key of Object.keys(errors)) if (!next[key]) delete errors[key];
	});

	async function focusFirstError() {
		await tick();
		const first = FIELD_ORDER.find((k) => errors[k]);
		if (first) form?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
	}

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		tried = true;
		failure = null;
		errors = check();
		if (Object.keys(errors).length) return focusFirstError();
		submitting = true;
		try {
			const fd = current();
			fd.set('kind', 'vraag');
			fd.set('js', '1');
			fd.set('website', '');
			if (token) fd.set('cf-turnstile-response', token);
			const res = await fetch('/api/submit', {
				method: 'POST',
				body: fd,
				headers: { accept: 'application/json' }
			});
			const body = (await res.json().catch(() => null)) as {
				ok?: boolean;
				errors?: FieldErrors;
				message?: string;
			} | null;
			if (res.ok && body?.ok) {
				done = true;
				await tick();
				success?.focus();
				return;
			}
			if (body?.errors) {
				errors = body.errors;
				await focusFirstError();
			} else failure = body?.message ?? 'Controleer uw internetverbinding en probeer opnieuw.';
			turnstile?.reset();
		} catch {
			failure = 'Controleer uw internetverbinding en probeer opnieuw.';
		} finally {
			submitting = false;
		}
	}
</script>

{#if done}
	<div class="tz-contact__success" tabindex="-1" bind:this={success}>
		<span class="tz-icon-chip tz-icon-chip--solid"><Icon name="circle-check" /></span>
		<h3 class="t-h3">Bedankt voor uw bericht</h3>
		<p>Wij antwoorden zo snel mogelijk.</p>
	</div>
{:else}
	<form
		class="tz-form"
		action="/api/submit"
		method="post"
		enctype="multipart/form-data"
		novalidate={enhanced}
		bind:this={form}
		{onsubmit}
	>
		<input type="hidden" name="kind" value="vraag" />
		<div class="app-hp" aria-hidden="true">
			<label for="c-website">Website</label><input
				id="c-website"
				name="website"
				tabindex="-1"
				autocomplete="off"
			/>
		</div>
		{#if failure}
			<Alert tone="danger" title="Uw bericht is niet verstuurd"
				>{failure}{#if phone}&nbsp;U kunt ook bellen naar {phone}.{/if}</Alert
			>
		{/if}
		<div class="tz-form__row">
			<FormField
				label="Naam"
				name="naam"
				id="c-naam"
				required
				autocomplete="name"
				bind:value={naam}
				error={errors.naam}
			/>
			<FormField
				label="E-mail"
				name="email"
				id="c-mail"
				type="email"
				required
				autocomplete="email"
				bind:value={email}
				error={errors.email}
			/>
		</div>
		<FormField
			label="Telefoon"
			name="telefoon"
			id="c-tel"
			type="tel"
			optional
			autocomplete="tel"
			bind:value={telefoon}
			error={errors.telefoon}
		/>
		<FormField
			label="Uw vraag"
			name="bericht"
			id="c-msg"
			as="textarea"
			required
			maxlength={LIMITS.message}
			count
			bind:value={bericht}
			error={errors.bericht}
		/>
		{#if turnstileSiteKey}<Turnstile
				siteKey={turnstileSiteKey}
				bind:token
				bind:this={turnstile}
			/>{/if}
		<div class="tz-form__foot">
			<button
				class={['tz-btn', submitting && 'is-loading']}
				type="submit"
				disabled={submitting}
				aria-busy={submitting ? 'true' : undefined}
				>{#if submitting}<Icon name="loader-circle" class="tz-spin" />{/if}
				<span class="tz-btn__label">Bericht versturen</span></button
			>
			<p class="tz-form__legal">Wij antwoorden zo snel mogelijk.</p>
		</div>
	</form>
{/if}
