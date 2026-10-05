<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { listMedia, uploadMedia, type AdminMedia } from '$lib/client/upload';

	/** Choose a photo from the library or upload a new one (with its alt text). */
	let { onpick, multiple = false }: { onpick: (m: AdminMedia[]) => void; multiple?: boolean } =
		$props();

	let dialog: HTMLDialogElement | undefined = $state();
	let items = $state<AdminMedia[]>([]);
	let selected = $state<string[]>([]);
	let tab = $state<'library' | 'upload'>('library');
	let files = $state<File[]>([]);
	let alts = $state<string[]>([]);
	let busy = $state(false);
	let message = $state<string | null>(null);

	export async function open(start: 'library' | 'upload' = 'library') {
		tab = start;
		selected = [];
		files = [];
		alts = [];
		message = null;
		dialog?.showModal();
		items = await listMedia();
	}

	function toggle(id: string) {
		if (!multiple) {
			selected = [id];
			return;
		}
		selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
	}

	function choose() {
		onpick(items.filter((m) => selected.includes(m.id)));
		dialog?.close();
	}

	async function upload() {
		busy = true;
		message = null;
		const done: AdminMedia[] = [];
		try {
			for (const [i, f] of files.entries()) done.push(await uploadMedia(f, alts[i] ?? ''));
			onpick(done);
			dialog?.close();
		} catch (e) {
			message = (e as Error).message;
			if (done.length) onpick(done);
		} finally {
			busy = false;
		}
	}
</script>

<dialog class="adm-dialog adm-dialog--wide" bind:this={dialog} aria-label="Foto kiezen">
	<div class="adm-dialog__head">
		<div class="tz-segment" role="tablist" aria-label="Foto kiezen">
			<button
				type="button"
				role="tab"
				aria-selected={tab === 'library'}
				onclick={() => (tab = 'library')}>Mediabibliotheek</button
			>
			<button
				type="button"
				role="tab"
				aria-selected={tab === 'upload'}
				onclick={() => (tab = 'upload')}>Nieuwe foto</button
			>
		</div>
		<button
			type="button"
			class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
			aria-label="Sluiten"
			onclick={() => dialog?.close()}><Icon name="x" /></button
		>
	</div>

	{#if tab === 'library'}
		<div class="adm-picker">
			{#each items as m (m.id)}
				<button
					type="button"
					class="adm-picker__item"
					aria-pressed={selected.includes(m.id)}
					onclick={() => toggle(m.id)}
				>
					<img src={m.src} alt={m.alt} loading="lazy" width={m.width} height={m.height} />
					{#if !m.alt}<span class="tz-badge tz-badge--warning adm-picker__flag"
							><span class="tz-badge__dot"></span>Alt ontbreekt</span
						>{/if}
				</button>
			{:else}
				<p class="adm-muted">Nog geen foto's. Kies Nieuwe foto om er een op te laden.</p>
			{/each}
		</div>
		<div class="adm-actions">
			<button type="button" class="tz-btn" disabled={!selected.length} onclick={choose}
				>Kiezen</button
			>
		</div>
	{:else}
		<div class="adm-stack">
			<label class="tz-drop">
				<Icon name="upload" />
				<span><strong>Kies {multiple ? "foto's" : 'een foto'}</strong> van uw toestel</span>
				<span class="tz-hint"
					>JPG, PNG of WebP tot 10 MB. Wordt verkleind tot 2400 px; de locatie uit de foto wordt
					verwijderd.</span
				>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					{multiple}
					onchange={(e) => {
						files = [...(e.currentTarget.files ?? [])];
						alts = files.map(() => '');
					}}
				/>
			</label>
			{#each files as f, i (f.name + i)}
				<div class="tz-field">
					<label class="tz-label" for="alt-{i}">Alt-tekst voor {f.name}</label>
					<input
						class="tz-input"
						id="alt-{i}"
						bind:value={alts[i]}
						placeholder="Bijvoorbeeld: Strak gesnoeide beukenhaag langs een oprit"
					/>
					<span class="tz-hint">Beschrijf wat je ziet. Nodig om te publiceren.</span>
				</div>
			{/each}
			{#if message}<div class="tz-alert tz-alert--danger" role="alert">
					<Icon name="circle-x" />
					<div class="tz-alert__text">{message}</div>
				</div>{/if}
			<div class="adm-actions">
				<button
					type="button"
					class={['tz-btn', busy && 'is-loading']}
					disabled={!files.length || busy}
					onclick={upload}
					>{#if busy}<Icon name="loader-circle" class="tz-spin" />{/if}<span class="tz-btn__label"
						>Opladen</span
					></button
				>
			</div>
		</div>
	{/if}
</dialog>
