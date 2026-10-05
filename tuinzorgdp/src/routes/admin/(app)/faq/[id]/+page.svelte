<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import CountedField from '$lib/components/admin/CountedField.svelte';
	import FormMessages from '$lib/components/admin/FormMessages.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { saving } from '$lib/client/enhance';

	let { data, form } = $props();
	// The editor works on a copy of the row.
	// svelte-ignore state_referenced_locally
	const q = data.faq;
	let question = $state(q.question);
	let answer = $state(q.answer);
	let serviceId = $state(q.service_id ?? '');
	let onHome = $state(q.show_on_home);
	let published = $state(q.is_published);
	let busy = $state(false);
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<svelte:head><title>{question} | FAQ | TuinZorg DP beheer</title></svelte:head>

<a class="adm-back" href="/admin/faq"><Icon name="chevron-left" /> FAQ</a>
<div class="adm-head"><h1>{question || 'Vraag'}</h1></div>

<FormMessages {form} />

<form method="post" action="?/save" class="adm-form" use:enhance={saving((b) => (busy = b))}>
	<div class="adm-card">
		<FormField
			label="Vraag"
			name="question"
			id="f-question"
			required
			bind:value={question}
			error={errors.question}
		/>
		<CountedField
			label="Antwoord"
			name="answer"
			as="textarea"
			rows={6}
			bind:value={answer}
			required
			error={errors.answer}
			hint="Markdown: een lege regel maakt een nieuwe alinea."
		/>
		<div class="tz-field">
			<label class="tz-label" for="f-svc">Dienst</label>
			<div class="tz-select-wrap">
				<select class="tz-select" id="f-svc" name="service_id" bind:value={serviceId}
					><option value="">Algemeen</option>{#each data.services as s (s.id)}<option value={s.id}
							>{s.title}</option
						>{/each}</select
				><Icon name="chevron-down" />
			</div>
			<span class="tz-hint"
				>Bij een dienst staat de vraag op die dienstpagina. Algemeen = op de FAQ-pagina.</span
			>
		</div>
		<label class="tz-check"
			><input type="checkbox" name="show_on_home" bind:checked={onHome} />
			<span>Toon op home</span></label
		>
		<label class="tz-check"
			><input type="checkbox" name="is_published" bind:checked={published} />
			<span>Zichtbaar op de website</span></label
		>
	</div>
	<SaveBar {busy} />
</form>

<div class="adm-actions adm-actions--start">
	<ConfirmDialog item={q.question} />
</div>
