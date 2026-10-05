<script lang="ts" module>
	export type GalleryRow = {
		media_id: string;
		src: string;
		alt: string;
		width: number;
		height: number;
		role: 'before' | 'after' | 'process' | 'result';
		in_home_gallery: boolean;
	};
</script>

<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import MediaPicker from './MediaPicker.svelte';

	/** The photos of a realisatie: role, Toon op home, alt text and order. Submitted as one JSON field. */
	let { rows = $bindable([]), name = 'photos' }: { rows?: GalleryRow[]; name?: string } = $props();

	const ROLES = [
		{ value: 'before', label: 'Voor' },
		{ value: 'after', label: 'Na' },
		{ value: 'process', label: 'Tijdens' },
		{ value: 'result', label: 'Resultaat' }
	] as const;

	let picker: MediaPicker | undefined = $state();
	let dragging = $state<number | null>(null);

	function move(from: number, to: number) {
		if (to < 0 || to >= rows.length || from === to) return;
		const [r] = rows.splice(from, 1);
		rows.splice(to, 0, r);
	}
</script>

<fieldset class="adm-gallery">
	<legend class="tz-label">Foto's ({rows.length})</legend>
	<input
		type="hidden"
		{name}
		value={JSON.stringify(
			rows.map(({ media_id, role, in_home_gallery, alt }) => ({
				media_id,
				role,
				in_home_gallery,
				alt
			}))
		)}
	/>
	<ol class="adm-gallery__list">
		{#each rows as row, i (row.media_id)}
			<li
				class="adm-gallery__row"
				class:is-dragging={dragging === i}
				draggable="true"
				ondragstart={() => (dragging = i)}
				ondragover={(e) => e.preventDefault()}
				ondrop={() => {
					if (dragging !== null) move(dragging, i);
					dragging = null;
				}}
				ondragend={() => (dragging = null)}
			>
				<img src={row.src} alt="" width={row.width} height={row.height} />
				<div class="adm-stack adm-stack--tight">
					<label class="tz-label" for="alt-{row.media_id}">Alt-tekst</label>
					<input
						class={['tz-input', !row.alt && 'adm-input--warn']}
						id="alt-{row.media_id}"
						bind:value={row.alt}
						placeholder="Beschrijf wat je ziet"
					/>
					<div class="adm-gallery__opts">
						<label class="adm-inline">
							<span>Rol</span>
							<select class="tz-select adm-select-sm" bind:value={row.role}>
								{#each ROLES as r (r.value)}<option value={r.value}>{r.label}</option>{/each}
							</select>
						</label>
						<label class="tz-check"
							><input type="checkbox" bind:checked={row.in_home_gallery} /> Toon op home</label
						>
					</div>
				</div>
				<div class="adm-gallery__btns">
					<button
						type="button"
						class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
						aria-label="Omhoog"
						disabled={i === 0}
						onclick={() => move(i, i - 1)}><Icon name="chevron-left" class="adm-rot90" /></button
					>
					<button
						type="button"
						class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
						aria-label="Omlaag"
						disabled={i === rows.length - 1}
						onclick={() => move(i, i + 1)}><Icon name="chevron-right" class="adm-rot90" /></button
					>
					<button
						type="button"
						class="tz-btn tz-btn--ghost tz-btn--icon tz-btn--sm"
						aria-label="Foto weghalen"
						onclick={() => rows.splice(i, 1)}><Icon name="trash-2" /></button
					>
				</div>
			</li>
		{/each}
	</ol>
	<div class="adm-actions adm-actions--start">
		<button
			type="button"
			class="tz-btn tz-btn--outline tz-btn--sm"
			onclick={() => picker?.open('upload')}><Icon name="upload" /> Foto's opladen</button
		>
		<button
			type="button"
			class="tz-btn tz-btn--outline tz-btn--sm"
			onclick={() => picker?.open('library')}><Icon name="image" /> Uit de bibliotheek</button
		>
	</div>
</fieldset>

<MediaPicker
	bind:this={picker}
	multiple
	onpick={(list) => {
		for (const m of list) {
			if (rows.some((r) => r.media_id === m.id)) continue;
			rows.push({
				media_id: m.id,
				src: m.src,
				alt: m.alt,
				width: m.width,
				height: m.height,
				role: 'result',
				in_home_gallery: false
			});
		}
	}}
/>
