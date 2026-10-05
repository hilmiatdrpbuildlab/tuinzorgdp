<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { telHref, whatsappHref } from '$lib/format';

	let { data } = $props();
	const c = $derived(data.settings.company);
</script>

<!-- Shown without JavaScript when a request could neither be mailed nor stored, or did not pass validation. -->
<Seo
	title="Niet verstuurd | TuinZorg DP"
	description="Uw aanvraag is niet verstuurd. Probeer opnieuw of neem rechtstreeks contact op."
	noindex
/>

<section class="tz-section">
	<div class="tz-container tz-stack" style="max-width: 760px">
		<div class="tz-alert tz-alert--danger" role="alert">
			<Icon name="circle-x" />
			<div>
				<h1 class="tz-alert__title">Uw aanvraag is niet verstuurd</h1>
				<div class="tz-alert__text">
					Controleer of alle verplichte velden ingevuld zijn en probeer opnieuw. Lukt het niet, neem
					dan rechtstreeks contact op.
				</div>
			</div>
		</div>
		<div class="app-links">
			<a class="tz-btn" href="/contact#offerte">Opnieuw proberen</a>
			{#if c.phone}<a class="tz-btn tz-btn--outline" href={telHref(c.phone)}
					><Icon name="phone" /> {c.phone}</a
				>{/if}
			{#if c.email}<a class="tz-btn tz-btn--outline" href="mailto:{c.email}"
					><Icon name="mail" /> {c.email}</a
				>{/if}
			{#if c.whatsapp}<a class="tz-btn tz-btn--outline" href={whatsappHref(c.whatsapp)}
					><Icon name="whatsapp" /> WhatsApp</a
				>{/if}
		</div>
	</div>
</section>
