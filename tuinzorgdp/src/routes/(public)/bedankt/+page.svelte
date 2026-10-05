<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/icons/Icon.svelte';
</script>

<!-- Landing page for the forms without JavaScript. -->
<Seo
	title="Bedankt | TuinZorg DP"
	description="Uw aanvraag is verstuurd. Wij nemen zo snel mogelijk contact met u op."
	noindex
/>

<section class="tz-section">
	<div class="tz-container">
		<div class="tz-contact__success app-center">
			<span class="tz-icon-chip tz-icon-chip--solid"><Icon name="circle-check" /></span>
			<h1 class="t-h2">Bedankt, uw aanvraag is verstuurd</h1>
			<p>
				Wij bekijken uw aanvraag en nemen zo snel mogelijk contact met u op. Een kopie staat in uw
				mailbox.
			</p>
			<a class="tz-textlink" href="/realisaties"
				>Bekijk intussen ons werk <Icon name="arrow-right" /></a
			>
		</div>
	</div>
</section>
