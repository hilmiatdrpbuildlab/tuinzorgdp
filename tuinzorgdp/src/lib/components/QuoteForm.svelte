<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { ACCEPTED_IMAGE_TYPES, scaleImage } from '$lib/client/images';
	import {
		MESSAGES,
		SIZE_OPTIONS,
		TIMING_OPTIONS,
		readForm,
		validate,
		type FieldErrors
	} from '$lib/forms';
	import { LIMITS } from '$lib/rules';
	import Alert from './Alert.svelte';
	import FormField from './FormField.svelte';
	import ServiceTiles, { type Tile } from './ServiceTiles.svelte';
	import Turnstile from './Turnstile.svelte';

	let {
		tiles,
		turnstileSiteKey = null,
		presetService = null,
		presetMunicipality = null,
		phone
	}: {
		tiles: Tile[];
		turnstileSiteKey?: string | null;
		presetService?: string | null;
		presetMunicipality?: string | null;
		phone?: string;
	} = $props();

	const FIELD_ORDER = [
		'diensten',
		'voornaam',
		'achternaam',
		'telefoon',
		'email',
		'adres',
		'postcode',
		'gemeente',
		'fotos',
		'bericht',
		'privacy'
	];

	// The preset only seeds the initial value.

	// svelte-ignore state_referenced_locally
	let diensten = $state<string[]>(presetService ? [presetService] : []);
	let voornaam = $state('');
	let achternaam = $state('');
	let telefoon = $state('');
	let email = $state('');
	let adres = $state('');
	let postcode = $state('');
	// svelte-ignore state_referenced_locally
	let gemeente = $state(presetMunicipality ?? '');
	let timing = $state('');
	let oppervlakte = $state('');
	let bericht = $state('');
	let privacy = $state(false);
	let files = $state<File[]>([]);
	let dragOver = $state(false);

	let errors = $state<FieldErrors>({});
	let tried = $state(false);
	let submitting = $state(false);
	let done = $state(false);
	let failure = $state<string | null>(null);
	let token = $state('');

	let form: HTMLFormElement | undefined = $state();
	let success: HTMLDivElement | undefined = $state();
	let turnstile: Turnstile | undefined = $state();
	let enhanced = $state(false);

	onMount(() => (enhanced = true));

	function current() {
		const fd = new FormData();
		for (const d of diensten) fd.append('diensten', d);
		const pairs: [string, string][] = [
			['voornaam', voornaam],
			['achternaam', achternaam],
			['telefoon', telefoon],
			['email', email],
			['adres', adres],
			['postcode', postcode],
			['gemeente', gemeente],
			['timing', timing],
			['oppervlakte', oppervlakte],
			['bericht', bericht]
		];
		for (const [k, v] of pairs) fd.set(k, v);
		if (privacy) fd.set('privacy', 'on');
		return fd;
	}

	function photoError(list: File[]): string | null {
		if (list.length > LIMITS.requestPhotos)
			return `U kunt maximaal ${LIMITS.requestPhotos} foto's meesturen.`;
		if (list.some((f) => !ACCEPTED_IMAGE_TYPES.includes(f.type)))
			return 'Dit bestandstype wordt niet ondersteund. Kies een JPG, PNG of WebP.';
		return null;
	}

	function check(): FieldErrors {
		const result = validate('offerte', readForm(current(), 'offerte'));
		const next: FieldErrors = result.ok ? {} : { ...result.errors };
		const pe = photoError(files);
		if (pe) next.fotos = pe;
		return next;
	}

	// After a first attempt, each error clears as soon as its value is valid.
	$effect(() => {
		if (!tried) return;
		const next = check();
		for (const key of Object.keys(errors)) if (!next[key]) delete errors[key];
	});

	function pick(list: FileList | null) {
		files = list ? [...list] : [];
		if (tried) errors.fotos = photoError(files) ?? '';
		if (!errors.fotos) delete errors.fotos;
	}

	async function focusFirstError() {
		await tick();
		const first = FIELD_ORDER.find((k) => errors[k]);
		if (!first || !form) return;
		const el = form.querySelector<HTMLElement>(`[name="${first}"]`);
		el?.focus();
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
			fd.set('kind', 'offerte');
			fd.set('js', '1');
			fd.set('website', '');
			if (token) fd.set('cf-turnstile-response', token);
			for (const [i, file] of files.entries()) {
				const { blob } = await scaleImage(file, 2000, 0.8);
				fd.append('fotos', blob, `foto-${i + 1}.jpg`);
			}
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
			} else {
				failure = body?.message ?? 'Controleer uw internetverbinding en probeer opnieuw.';
			}
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
		<h3 class="t-h3">Bedankt, uw aanvraag is verstuurd</h3>
		<p>
			Wij bekijken uw aanvraag en nemen zo snel mogelijk contact met u op. Een kopie staat in uw
			mailbox.
		</p>
		<a class="tz-textlink" href="/realisaties"
			>Bekijk intussen ons werk <Icon name="arrow-right" /></a
		>
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
		<input type="hidden" name="kind" value="offerte" />
		<div class="app-hp" aria-hidden="true">
			<label for="q-website">Website</label><input
				id="q-website"
				name="website"
				tabindex="-1"
				autocomplete="off"
			/>
		</div>
		{#if failure}
			<Alert tone="danger" title="Uw aanvraag is niet verstuurd"
				>{failure}{#if phone}&nbsp;U kunt ook bellen naar {phone}.{/if}</Alert
			>
		{/if}
		<ServiceTiles {tiles} bind:group={diensten} error={errors.diensten} />
		<div class="tz-form__row">
			<FormField
				label="Voornaam"
				name="voornaam"
				id="q-voornaam"
				required
				autocomplete="given-name"
				bind:value={voornaam}
				error={errors.voornaam}
			/>
			<FormField
				label="Achternaam"
				name="achternaam"
				id="q-naam"
				required
				autocomplete="family-name"
				bind:value={achternaam}
				error={errors.achternaam}
			/>
		</div>
		<div class="tz-form__row">
			<FormField
				label="Telefoon"
				name="telefoon"
				id="q-tel"
				type="tel"
				required
				autocomplete="tel"
				inputmode="tel"
				placeholder="0470 12 34 56"
				bind:value={telefoon}
				error={errors.telefoon}
			/>
			<FormField
				label="E-mail"
				name="email"
				id="q-mail"
				type="email"
				required
				autocomplete="email"
				placeholder="naam@voorbeeld.be"
				bind:value={email}
				error={errors.email}
			/>
		</div>
		<FormField
			label="Adres van de tuin"
			name="adres"
			id="q-adres"
			required
			autocomplete="street-address"
			placeholder="Straat en huisnummer"
			bind:value={adres}
			error={errors.adres}
		/>
		<div class="tz-form__row tz-form__row--3">
			<FormField
				label="Postcode"
				name="postcode"
				id="q-pc"
				required
				autocomplete="postal-code"
				inputmode="numeric"
				pattern={'[1-9][0-9]{3}'}
				maxlength={4}
				placeholder="2000"
				bind:value={postcode}
				error={errors.postcode}
			/>
			<FormField
				label="Gemeente"
				name="gemeente"
				id="q-gem"
				required
				autocomplete="address-level2"
				bind:value={gemeente}
				error={errors.gemeente}
			/>
		</div>
		<div class="tz-form__row">
			<FormField
				label="Gewenste timing"
				name="timing"
				id="q-wanneer"
				as="select"
				optional
				options={TIMING_OPTIONS}
				bind:value={timing}
			/>
			<FormField
				label="Oppervlakte tuin"
				name="oppervlakte"
				id="q-opp"
				as="select"
				optional
				options={SIZE_OPTIONS}
				placeholderOption="Ongeveer"
				bind:value={oppervlakte}
			/>
		</div>
		<div class={['tz-field', errors.fotos && 'tz-field--error']}>
			<span class="tz-label" id="q-foto-l"
				>Foto's van uw tuin <span class="tz-label__opt">(optioneel)</span></span
			>
			<label
				class={['tz-drop', dragOver && 'is-over']}
				ondragenter={() => (dragOver = true)}
				ondragover={() => (dragOver = true)}
				ondragleave={() => (dragOver = false)}
				ondrop={() => (dragOver = false)}
			>
				<Icon name="upload" />
				<span><strong>Kies foto's</strong> of sleep ze hierheen</span>
				<span class="tz-hint">JPG, PNG of WebP, maximaal 5 foto's van 10 MB</span>
				{#if files.length}<span class="tz-hint">{files.map((f) => f.name).join(', ')}</span>{/if}
				<input
					type="file"
					name="fotos"
					accept="image/jpeg,image/png,image/webp"
					multiple
					aria-labelledby="q-foto-l"
					aria-describedby={errors.fotos ? 'q-foto-err' : undefined}
					onchange={(e) => pick(e.currentTarget.files)}
				/>
			</label>
			{#if errors.fotos}<span class="tz-msg tz-msg--error" id="q-foto-err"
					><Icon name="circle-x" /> {errors.fotos}</span
				>{/if}
		</div>
		<FormField
			label="Vragen en opmerkingen"
			name="bericht"
			id="q-msg"
			as="textarea"
			required
			maxlength={LIMITS.message}
			count
			placeholder="Beschrijf kort wat u wilt laten doen"
			bind:value={bericht}
			error={errors.bericht}
		/>
		<div class={['tz-field', errors.privacy && 'tz-field--error']}>
			<label class="tz-check"
				><input
					type="checkbox"
					name="privacy"
					required
					bind:checked={privacy}
					aria-invalid={errors.privacy ? 'true' : undefined}
					aria-describedby={errors.privacy ? 'q-privacy-err' : undefined}
				/>
				<span
					>Ik ga akkoord dat TuinZorg DP mijn gegevens gebruikt om mijn aanvraag te beantwoorden. <a
						href="/privacy">Privacybeleid</a
					></span
				></label
			>
			{#if errors.privacy}<span class="tz-msg tz-msg--error" id="q-privacy-err"
					><Icon name="circle-x" /> {MESSAGES.privacy}</span
				>{/if}
		</div>
		{#if turnstileSiteKey}<Turnstile
				siteKey={turnstileSiteKey}
				bind:token
				bind:this={turnstile}
			/>{/if}
		<div class="tz-form__foot">
			<button
				class={['tz-btn tz-btn--lg', submitting && 'is-loading']}
				type="submit"
				disabled={submitting}
				aria-busy={submitting ? 'true' : undefined}
				>{#if submitting}<Icon name="loader-circle" class="tz-spin" />{/if}
				<span class="tz-btn__label">Offerte aanvragen</span>
				<span class="tz-btn__chip"><Icon name="send" /></span></button
			>
			<p class="tz-form__legal">Gratis en zonder verplichting. Wij antwoorden zo snel mogelijk.</p>
		</div>
	</form>
{/if}
