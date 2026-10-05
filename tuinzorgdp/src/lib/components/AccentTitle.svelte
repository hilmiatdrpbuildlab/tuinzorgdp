<script lang="ts">
	/** A heading with one accent word: the component splits `title` around `accentWord`. */
	let {
		title,
		accentWord,
		level = 2,
		id,
		class: className = ''
	}: {
		title: string;
		accentWord?: string | null;
		level?: 1 | 2 | 3;
		id?: string;
		class?: string;
	} = $props();

	const parts = $derived.by(() => {
		if (!accentWord) return { before: title, word: '', after: '' };
		const i = title.toLowerCase().indexOf(accentWord.toLowerCase());
		if (i === -1) return { before: title, word: '', after: '' };
		return {
			before: title.slice(0, i),
			word: title.slice(i, i + accentWord.length),
			after: title.slice(i + accentWord.length)
		};
	});
</script>

<svelte:element this={`h${level}`} class={className} {id}
	>{parts.before}{#if parts.word}<span class="tz-accent-word">{parts.word}</span
		>{/if}{parts.after}</svelte:element
>
