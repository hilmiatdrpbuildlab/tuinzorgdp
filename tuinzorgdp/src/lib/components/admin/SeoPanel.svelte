<script lang="ts">
	import { LIMITS } from '$lib/rules';
	import CountedField from './CountedField.svelte';

	let {
		seoTitle = $bindable(''),
		metaDescription = $bindable(''),
		path,
		fallbackTitle
	}: {
		seoTitle?: string | null;
		metaDescription?: string | null;
		path: string;
		fallbackTitle: string;
	} = $props();
</script>

<details class="adm-panel">
	<summary>SEO <span class="adm-muted">titel en beschrijving in Google</span></summary>
	<div class="adm-stack">
		<CountedField
			label="SEO-titel"
			name="seo_title"
			bind:value={seoTitle}
			max={LIMITS.seoTitle}
			placeholder={fallbackTitle}
			hint="Leeg laten = de naam van de pagina met | TuinZorg DP."
		/>
		<CountedField
			label="Beschrijving"
			name="meta_description"
			as="textarea"
			rows={3}
			bind:value={metaDescription}
			max={LIMITS.metaDescription}
			hint="Wat Google onder de titel toont. Leeg laten = de samenvatting."
		/>
		<div class="adm-serp" aria-label="Voorbeeld in Google">
			<span class="adm-serp__url">tuinzorgdp.be{path}</span>
			<span class="adm-serp__title">{seoTitle || fallbackTitle}</span>
			<span class="adm-serp__desc">{metaDescription || '…'}</span>
		</div>
	</div>
</details>
