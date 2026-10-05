<script lang="ts">
	import type { Media } from '$lib/content/types';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/icons';
	import { SIZES } from '$lib/media';
	import AccentTitle from './AccentTitle.svelte';
	import MediaSlot from './MediaSlot.svelte';

	const PERK_ICONS: IconName[] = ['badge-check', 'handshake', 'message-circle', 'recycle'];

	let {
		eyebrow,
		title,
		accentWord,
		lead,
		perks,
		photos,
		linkHref = '#contact'
	}: {
		eyebrow: string;
		title: string;
		accentWord?: string | null;
		lead: string;
		perks: { title: string; text: string }[];
		photos: (Media | null)[];
		linkHref?: string;
	} = $props();
</script>

<section class="tz-section" id="over" aria-labelledby="over-title">
	<div class="tz-container tz-about">
		<div class="tz-about__photos">
			<MediaSlot
				media={photos[0]}
				ratio="3x4"
				lg
				sizes={SIZES.third}
				field="pages.home · about-foto 1"
				class="app-relative"
			/>
			<MediaSlot
				media={photos[1]}
				ratio="4x5"
				lg
				sizes={SIZES.third}
				field="pages.home · about-foto 2"
				class="app-relative"
			>
				<span class="tz-badge tz-badge--glass"><Icon name="truck" /> Altijd op tijd</span>
			</MediaSlot>
		</div>
		<div class="tz-about__copy">
			<span class="tz-eyebrow tz-eyebrow--pill"><span class="tz-leaf"></span>{eyebrow}</span>
			<AccentTitle {title} {accentWord} id="over-title" class="t-h1" />
			<p class="t-lead">{lead}</p>
			<ul class="tz-perks" role="list">
				{#each perks as perk, i (perk.title)}
					<li class="tz-perk">
						<span class="tz-icon-chip"><Icon name={PERK_ICONS[i % 4]} /></span>
						<div><strong>{perk.title}</strong><span>{perk.text}</span></div>
					</li>
				{/each}
			</ul>
			<div><a class="tz-textlink" href={linkHref}>Maak kennis <Icon name="arrow-right" /></a></div>
		</div>
	</div>
</section>
