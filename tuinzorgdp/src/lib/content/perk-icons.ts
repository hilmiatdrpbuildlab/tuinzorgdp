import type { IconName } from '$lib/icons/icons';

/** Icons the client can pick for a reason under "Waarom TuinZorg DP", with a Dutch label for the CMS. */
export const PERK_ICONS = [
	{ name: 'badge-check', label: 'Keurmerk (ervaring, kwaliteit)' },
	{ name: 'shield-check', label: 'Schild (betrouwbaar, veilig)' },
	{ name: 'handshake', label: 'Handdruk (persoonlijk, afspraken)' },
	{ name: 'sprout', label: 'Scheut (duurzaam, natuur)' },
	{ name: 'message-circle', label: 'Tekstballon (communicatie)' },
	{ name: 'calendar', label: 'Kalender (flexibele planning)' },
	{ name: 'clock', label: 'Klok (op tijd)' },
	{ name: 'leaf', label: 'Blad (groen)' },
	{ name: 'recycle', label: 'Recycle (afval, hergebruik)' },
	{ name: 'star', label: 'Ster (tevreden klanten)' },
	{ name: 'truck', label: 'Bestelwagen (eigen materiaal)' },
	{ name: 'scissors', label: 'Schaar (vakwerk)' }
] as const satisfies readonly { name: IconName; label: string }[];

export type PerkIcon = (typeof PERK_ICONS)[number]['name'];
export const PERK_ICON_NAMES = PERK_ICONS.map((i) => i.name) as [PerkIcon, ...PerkIcon[]];

/** For reasons saved before each one had its own icon: the six defaults in order. */
export const DEFAULT_PERK_ICONS: PerkIcon[] = [
	'badge-check',
	'shield-check',
	'handshake',
	'sprout',
	'message-circle',
	'calendar'
];
export const perkIcon = (icon: PerkIcon | undefined, i: number): PerkIcon =>
	icon ?? DEFAULT_PERK_ICONS[i % DEFAULT_PERK_ICONS.length];
