<script lang="ts">
	import { enhance } from '$app/forms';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const s = data.settings;
	const c = s.company;
	let name = $state(c.name ?? '');
	let street = $state(c.street ?? '');
	let postcode = $state(c.postcode ?? '');
	let city = $state(c.city ?? '');
	let region = $state(c.region ?? '');
	let vat = $state(c.vat ?? '');
	let email = $state(c.email ?? '');
	let phone = $state(c.phone ?? '');
	let whatsapp = $state(c.whatsapp ?? '');
	let showStreet = $state(c.showStreet ?? false);
	let hoursMode = $state<'days' | 'label'>(s.hours.label ? 'label' : 'days');
	let hoursLabel = $state(s.hours.label ?? '');
	let days = $state<string[]>([...(s.hours.days ?? [])]);
	let opens = $state(s.hours.opens ?? '');
	let closes = $state(s.hours.closes ?? '');
	let instagram = $state(s.socials.instagram ?? '');
	let facebook = $state(s.socials.facebook ?? '');
	let profileUrl = $state(s.google.profileUrl ?? '');
	let writeReviewUrl = $state(s.google.writeReviewUrl ?? '');
	let placeId = $state(s.google.placeId ?? '');
	let lat = $state(s.geo.lat?.toString().replace('.', ',') ?? '');
	let lng = $state(s.geo.lng?.toString().replace('.', ',') ?? '');
	let mapsEmbedUrl = $state(s.maps_embed_url ?? '');
	let notifyEmail = $state(s.notify_email);
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<svelte:head><title>Instellingen | TuinZorg DP beheer</title></svelte:head>

<div class="adm-head"><h1>Instellingen</h1></div>
<p class="adm-muted">
	Bedrijfsgegevens, openingsuren en links die op elke pagina van de website staan.
</p>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<h2>Bedrijf</h2>
		<FormField
			label="Bedrijfsnaam"
			name="name"
			id="f-name"
			required
			bind:value={name}
			error={errors.name}
		/>
		<FormField
			label="Straat en nummer"
			name="street"
			id="f-street"
			optional
			bind:value={street}
			autocomplete="street-address"
		/>
		<label class="tz-check"
			><input type="checkbox" name="showStreet" bind:checked={showStreet} />
			<span>Straat tonen op de website</span></label
		>
		<div class="adm-two">
			<FormField
				label="Postcode"
				name="postcode"
				id="f-postcode"
				optional
				bind:value={postcode}
				inputmode="numeric"
				error={errors.postcode}
			/>
			<FormField label="Gemeente" name="city" id="f-city" optional bind:value={city} />
		</div>
		<div class="adm-two">
			<FormField
				label="Regio"
				name="region"
				id="f-region"
				optional
				bind:value={region}
				hint="Bijvoorbeeld: Antwerpen"
			/>
			<FormField
				label="Btw-nummer"
				name="vat"
				id="f-vat"
				optional
				bind:value={vat}
				placeholder="BE 0123.456.789"
				error={errors.vat}
			/>
		</div>
		<div class="adm-two">
			<FormField
				label="E-mail"
				name="email"
				id="f-email"
				type="email"
				optional
				bind:value={email}
				error={errors.email}
			/>
			<FormField
				label="Telefoon"
				name="phone"
				id="f-phone"
				type="tel"
				optional
				bind:value={phone}
				placeholder="+32 469 41 37 30"
				error={errors.phone}
			/>
		</div>
		<FormField
			label="WhatsApp-nummer"
			name="whatsapp"
			id="f-whatsapp"
			type="tel"
			optional
			bind:value={whatsapp}
			hint="Laat leeg om de WhatsApp-knop te verbergen."
			error={errors.whatsapp}
		/>
	</div>

	<div class="adm-card">
		<h2>Openingsuren</h2>
		<div class="tz-checks" role="radiogroup" aria-label="Openingsuren invullen als">
			<label class="tz-check"
				><input type="radio" name="hours_mode" value="days" bind:group={hoursMode} />
				<span>Dagen en uren</span></label
			>
			<label class="tz-check"
				><input type="radio" name="hours_mode" value="label" bind:group={hoursMode} />
				<span>Vrije tekst</span></label
			>
		</div>
		{#if hoursMode === 'label'}
			<FormField
				label="Openingsuren"
				name="hours_label"
				id="f-hours-label"
				bind:value={hoursLabel}
				placeholder="Ma tot za, 08:00–18:00, of op afspraak"
				error={errors.hours_label}
			/>
		{:else}
			<fieldset class={['tz-field hours-days', errors.days && 'tz-field--error']}>
				<legend class="tz-label">Dagen</legend>
				<div class="hours-days__list">
					{#each data.days as d (d.value)}
						<label class="tz-check"
							><input type="checkbox" name="days" value={d.value} bind:group={days} />
							<span>{d.label}</span></label
						>
					{/each}
				</div>
				{#if errors.days}<span class="tz-msg tz-msg--error"
						><Icon name="circle-x" /> {errors.days}</span
					>{/if}
			</fieldset>
			<div class="adm-two">
				<FormField
					label="Open van"
					name="opens"
					id="f-opens"
					type="time"
					bind:value={opens}
					error={errors.opens}
				/>
				<FormField
					label="Tot"
					name="closes"
					id="f-closes"
					type="time"
					bind:value={closes}
					error={errors.closes}
				/>
			</div>
		{/if}
	</div>

	<div class="adm-card">
		<h2>Social media</h2>
		<FormField
			label="Instagram"
			name="instagram"
			id="f-instagram"
			type="url"
			optional
			bind:value={instagram}
			placeholder="https://www.instagram.com/…"
			error={errors.instagram}
		/>
		<FormField
			label="Facebook"
			name="facebook"
			id="f-facebook"
			type="url"
			optional
			bind:value={facebook}
			placeholder="https://www.facebook.com/…"
			error={errors.facebook}
		/>
	</div>

	<div class="adm-card">
		<h2>Google</h2>
		<FormField
			label="Google-bedrijfsprofiel"
			name="profileUrl"
			id="f-profile"
			type="url"
			optional
			bind:value={profileUrl}
			hint="De link naar uw profiel in Google Maps."
			error={errors.profileUrl}
		/>
		<FormField
			label="Link om een review te schrijven"
			name="writeReviewUrl"
			id="f-review"
			type="url"
			optional
			bind:value={writeReviewUrl}
			error={errors.writeReviewUrl}
		/>
		<FormField
			label="Place id"
			name="placeId"
			id="f-place"
			optional
			bind:value={placeId}
			hint="Nodig om de Google-score elke nacht automatisch op te halen."
			error={errors.placeId}
		/>
	</div>

	<div class="adm-card">
		<h2>Kaart en locatie</h2>
		<div class="adm-two">
			<FormField
				label="Breedtegraad"
				name="lat"
				id="f-lat"
				optional
				inputmode="decimal"
				bind:value={lat}
				placeholder="51,13"
				error={errors.lat}
			/>
			<FormField
				label="Lengtegraad"
				name="lng"
				id="f-lng"
				optional
				inputmode="decimal"
				bind:value={lng}
				placeholder="4,57"
				error={errors.lng}
			/>
		</div>
		<FormField
			label="Google Maps insluiten"
			name="maps_embed_url"
			id="f-maps"
			type="url"
			optional
			bind:value={mapsEmbedUrl}
			hint="In Google Maps: Delen, Kaart insluiten. Plak alleen het adres na src=."
			placeholder="https://www.google.com/maps/embed?pb=…"
			error={errors.maps_embed_url}
		/>
	</div>

	<div class="adm-card">
		<h2>Meldingen</h2>
		<FormField
			label="E-mail voor nieuwe aanvragen"
			name="notify_email"
			id="f-notify"
			type="email"
			required
			bind:value={notifyEmail}
			error={errors.notify_email}
		/>
	</div>

	<SaveBar {busy} />
</form>

<style>
	.hours-days {
		border: 0;
		padding: 0;
		margin: 0;
	}
	.hours-days__list {
		display: grid;
		gap: var(--space-xs) var(--space-md);
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	}
</style>
