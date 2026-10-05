/**
 * The launch content, in database row shape. scripts/seed-content.ts and scripts/import-photos.ts write
 * it to Neon; server/content.ts uses it as the fallback when the build cannot reach a database.
 * Copy comes from the current site and the design system (design-system/components/_partials).
 * Nothing here is invented: unknown facts (address, hours, VAT number, areas, reviews) stay empty.
 */
import credits from '../../../../design-system/assets/photos/credits.json';
import { stableId } from '../stable-id';

export type SeedMedia = {
	id: string;
	/** `ds:` = the 1200 px copy in the design system (fallback builds); originals/ = the bucket. */
	source_path: string;
	original_path: string;
	file_name: string;
	width: number;
	height: number;
	alt: string;
	category: string;
	focal_y?: number;
};

type Credit = {
	path: string;
	alt: string;
	category: string;
	original: string;
	size: [number, number];
};

const fileName = (p: string) => p.split('/').pop() ?? p;

export const seedMedia: SeedMedia[] = (credits as unknown as Credit[]).map((c) => ({
	id: stableId(`media:${fileName(c.path)}`),
	source_path: c.path,
	original_path: c.original,
	file_name: fileName(c.path),
	width: c.size[0],
	height: c.size[1],
	alt: c.alt,
	category: c.category
}));

export const mediaId = (file: string) => {
	const m = seedMedia.find((x) => x.file_name === file);
	if (!m) throw new Error(`Unknown seed photo ${file}`);
	return m.id;
};

// ---------------------------------------------------------------- services

export const seedServices = [
	{
		slug: 'maaien-en-bosmaaien',
		title: 'Maaien en bosmaaien',
		short_label: 'Maaien',
		subtitle: 'Strak gazon, nette randen',
		summary:
			'Een strak en gezond gazon is het visitekaartje van uw tuin. Wij maaien op de juiste hoogte en werken randen en moeilijke plekken bij met de bosmaaier.',
		body: 'Een gazon dat regelmatig op de juiste hoogte gemaaid wordt, blijft dicht, groen en gezond. Wij maaien uw gazon en werken randen, bermen en taluds bij met de bosmaaier, ook waar een grasmaaier niet bij kan.\n\nHet maaisel voeren wij netjes af, zodat u alleen het resultaat ziet.',
		bullets: [
			'Regelmatig maaien op de juiste grashoogte',
			'Randen, bermen en taluds met de bosmaaier',
			'Maaisel netjes afgevoerd'
		],
		icon: 'mower' as const,
		cover: 'maaien-gestreept.jpg',
		is_featured: true
	},
	{
		slug: 'gazononderhoud',
		title: 'Gazononderhoud',
		short_label: 'Gazon',
		subtitle: 'Verticuteren en graszoden leggen',
		summary:
			'Mos en vilt eruit, lucht en licht erin. Of meteen een nieuw, groen gazon met graszoden.',
		body: 'Een vermoeid gazon krijgt nieuwe kracht door te verticuteren: wij halen mos en vilt uit de grasmat, zodat lucht, water en licht weer bij de wortels komen.\n\nIs het gazon aan vervanging toe, dan pellen wij het oude gras af en leggen wij nieuwe graszoden. Zo heeft u meteen een groen gazon.',
		bullets: [
			'Verticuteren in het voorjaar of het najaar',
			'Oud gazon afpellen',
			'Nieuwe graszoden leggen'
		],
		icon: 'grass' as const,
		cover: 'grasmat-voortuin.jpg',
		is_featured: false
	},
	{
		slug: 'onkruidbestrijding',
		title: 'Onkruidbestrijding',
		short_label: 'Onkruid',
		subtitle: 'Borders, paden en bestrating',
		summary:
			'Wij verwijderen onkruid zorgvuldig uit tuin, borders en bestrating voor een nette uitstraling.',
		body: 'Onkruid tussen de tegels of in de borders maakt een tuin snel rommelig. Wij verwijderen het zorgvuldig, in borders, op paden en tussen de bestrating.\n\nWilt u minder onkruid in de toekomst? Een laag schors of grind in de borders helpt.',
		bullets: ['Onkruid uit borders en plantvakken', 'Paden en bestrating onkruidvrij'],
		icon: 'shovel' as const,
		cover: null,
		is_featured: false
	},
	{
		slug: 'snoeien',
		title: 'Snoeien',
		short_label: 'Snoeien',
		subtitle: 'Hagen, struiken en bomen',
		summary:
			'Op het juiste moment en met de juiste techniek, zodat uw planten gezond blijven en netjes groeien.',
		body: 'Wij snoeien hagen, struiken en kleine bomen op het juiste moment en met de juiste techniek. Zo blijven uw planten gezond en groeien ze netjes in vorm.\n\nOok voor vormsnoei, zoals taxuszuilen, kunt u bij ons terecht. Het snoeiafval nemen wij mee.',
		bullets: [
			'Hagen strak in vorm',
			'Struiken en kleine bomen',
			'Vormsnoei',
			'Snoeiafval afgevoerd'
		],
		icon: 'scissors' as const,
		cover: 'haag-tegelpad.jpg',
		is_featured: false
	},
	{
		slug: 'lamellen-plaatsen',
		title: 'Lamellen plaatsen',
		short_label: 'Lamellen',
		subtitle: 'In uw draadafsluiting',
		summary: 'Meer privacy en beschutting met lamellen in uw draadafsluiting, vakkundig geplaatst.',
		body: 'Met lamellen in uw draadafsluiting krijgt u meer privacy en beschutting, zonder een nieuwe afsluiting te plaatsen. Wij vlechten de lamellen strak en recht in uw bestaande draad.\n\nOok rond een containerplaats of bij een poort zorgen lamellen voor een nette afwerking.',
		bullets: ['Lamellen in bestaande draadafsluiting', 'Strak en recht geplaatst'],
		icon: 'fence' as const,
		cover: 'lamellen-border.jpg',
		is_featured: false
	},
	{
		slug: 'tuinafboording',
		title: 'Tuinafboording',
		short_label: 'Afboording',
		subtitle: 'Ook in cortenstaal',
		summary: 'Een strakke, duurzame scheiding tussen gazon, borders en paden.',
		body: 'Een tuinafboording zorgt voor een strakke, duurzame scheiding tussen gazon, borders en paden. Recht of in een vloeiende bocht, ook in cortenstaal.\n\nDe randen blijven mooi en het gras groeit niet in de borders.',
		bullets: ['Rechte of gebogen afboording', 'Ook in cortenstaal'],
		icon: 'ruler' as const,
		cover: 'cortenstaal-border.jpg',
		is_featured: false
	},
	{
		slug: 'materialen-invoeren',
		title: 'Materialen invoeren',
		short_label: 'Materialen',
		subtitle: 'Schors, grind en meer',
		summary:
			'Wij leveren en verspreiden schors en grind voor paden en borders. Dat beperkt ook onkruidgroei.',
		body: 'Wij leveren en verspreiden schors, grind en andere materialen in uw borders en op uw paden. Een goede laag schors of grind geeft een verzorgde uitstraling en beperkt onkruidgroei.',
		bullets: ['Houtschors in borders', 'Grind voor paden', 'Geleverd en verspreid'],
		icon: 'layers' as const,
		cover: 'schors-kastanjehek.jpg',
		is_featured: false
	}
].map((s, i) => ({ ...s, id: stableId(`service:${s.slug}`), sort_order: i, is_published: true }));

export const serviceId = (slug: string) => {
	const s = seedServices.find((x) => x.slug === slug);
	if (!s) throw new Error(`Unknown seed service ${slug}`);
	return s.id;
};

// ---------------------------------------------------------------- pages

export const seedPages = [
	{
		slug: 'home',
		title: 'Tuinonderhoud met passie',
		intro: null,
		body: null,
		hero: 'gazon-gestreept-haag.jpg',
		seo_title: 'Tuinonderhoud met passie | TuinZorg DP',
		meta_description:
			'Professioneel en betrouwbaar tuinonderhoud: maaien, snoeien, verticuteren, graszoden, lamellen, tuinafboording en schors of grind invoeren. Gratis offerte.',
		blocks: {
			hero: {
				title: 'Uw tuin, altijd verzorgd en mooi',
				accentWord: 'altijd verzorgd',
				lead: 'Professioneel en betrouwbaar tuinonderhoud voor particulieren en bedrijven. Van maaien en snoeien tot een nieuw gazon, lamellen en strakke borders.',
				usps: ['Ervaring en kennis', 'Perfecte afwerking', 'Eerlijke prijzen']
			},
			about: {
				eyebrow: 'Waarom TuinZorg DP',
				title: 'Uw betrouwbare partner voor tuinonderhoud',
				accentWord: 'tuinonderhoud',
				lead: 'Met passie voor groen en oog voor detail zorg ik ervoor dat iedere tuin netjes, gezond en verzorgd blijft. Een kleine stadstuin of een ruime buitenruimte: elke opdracht krijgt dezelfde aandacht.',
				perks: [
					{ title: 'Ervaring', text: 'Praktijkkennis van alle soorten tuinen.' },
					{ title: 'Betrouwbaar', text: 'Afspraken worden altijd nagekomen.' },
					{ title: 'Persoonlijke aanpak', text: 'Werk afgestemd op uw wensen en uw tuin.' },
					{ title: 'Duurzaam', text: 'Zorg voor gezonde planten en respect voor de natuur.' }
				],
				mediaIds: [mediaId('cortenstaal-border.jpg'), mediaId('bestelwagen-oprit.jpg')]
			},
			cta: {
				title: 'Klaar voor een tuin waar u zorgeloos van geniet?',
				accentWord: 'zorgeloos',
				lead: 'Vertel ons wat uw tuin nodig heeft. U krijgt een duidelijke offerte, gratis en zonder verplichting.'
			}
		}
	},
	{
		slug: 'diensten',
		title: 'Alles voor een verzorgde tuin',
		intro:
			'Van een eenmalige onderhoudsbeurt tot periodiek tuinonderhoud. Kies wat u nodig heeft, of laat ons alles uit handen nemen.',
		body: null,
		hero: null,
		seo_title: 'Diensten: maaien, snoeien, gazon en meer | TuinZorg DP',
		meta_description:
			'Maaien en bosmaaien, gazononderhoud, onkruidbestrijding, snoeien, lamellen plaatsen, tuinafboording en materialen invoeren. Vraag uw gratis offerte aan.',
		blocks: {}
	},
	{
		slug: 'realisaties',
		title: 'Ons werk in uw buurt',
		intro: 'Echte tuinen, echte resultaten. Elke foto is een opdracht van TuinZorg DP.',
		body: null,
		hero: null,
		seo_title: 'Realisaties: ons werk in uw buurt | TuinZorg DP',
		meta_description:
			'Bekijk tuinen die TuinZorg DP onderhield: gestreepte gazons, strak gesnoeide hagen, nieuwe graszoden, lamellen, cortenstalen borders en verse schors.',
		blocks: {}
	},
	{
		slug: 'contact',
		title: 'Vraag uw gratis offerte aan',
		intro:
			'Vul het formulier in, bel of stuur een e-mail. Wij nemen zo snel mogelijk contact met u op en bespreken wat uw tuin nodig heeft.',
		body: null,
		hero: 'bestelwagen-aanhanger.jpg',
		seo_title: 'Contact en gratis offerte | TuinZorg DP',
		meta_description:
			'Vraag uw gratis offerte aan voor tuinonderhoud, of stel uw vraag. Bel +32 469 41 37 30, mail info@tuinzorgdp.be of stuur een WhatsApp.',
		blocks: {}
	},
	{
		slug: 'privacy',
		title: 'Privacybeleid',
		intro: 'Hoe TuinZorg DP omgaat met de gegevens die u ons bezorgt.',
		hero: null,
		seo_title: 'Privacybeleid | TuinZorg DP',
		meta_description:
			'Welke gegevens TuinZorg DP verzamelt via het offerte- en contactformulier, waarom, hoe lang wij ze bewaren en hoe u ons kunt contacteren.',
		blocks: {},
		body: `*Ontwerp, nog goed te keuren door TuinZorg DP.*

## Welke gegevens wij verzamelen

Als u het offerteformulier invult, ontvangen wij uw naam, telefoonnummer, e-mailadres, het adres van de tuin, de diensten die u kiest, uw bericht en, als u die toevoegt, foto's van uw tuin. Bij een algemene vraag ontvangen wij uw naam, e-mailadres, uw vraag en eventueel uw telefoonnummer.

Wij bewaren geen IP-adres bij uw aanvraag.

## Waarom

Wij gebruiken deze gegevens alleen om uw aanvraag te beantwoorden, een offerte op te maken en de afspraak met u te plannen. Wij verkopen of delen uw gegevens niet met derden voor marketing.

## Hoe lang

Aanvragen en de foto's die u meestuurt, worden 12 maanden na ontvangst automatisch verwijderd.

## Wie verwerkt uw gegevens

Uw aanvraag wordt opgeslagen bij onze hostingpartners in de Europese Unie (Neon, Frankfurt) en verstuurd via onze e-maildienst (Brevo). Formulieren worden beschermd tegen spam met Cloudflare Turnstile.

## Cookies

Deze website plaatst geen cookies voor statistieken of reclame. Wij meten bezoeken met Cloudflare Web Analytics, zonder cookies. De kaart van Google Maps laadt pas als u erop klikt.

## Uw rechten

U kunt altijd vragen welke gegevens wij van u hebben, ze laten verbeteren of laten verwijderen. Stuur daarvoor een e-mail naar info@tuinzorgdp.be.`
	}
].map((p) => ({ ...p, id: stableId(`page:${p.slug}`) }));

// ---------------------------------------------------------------- FAQ

export const seedFaqs = [
	{
		question: 'In welke gemeenten werkt TuinZorg DP?',
		answer:
			'Wij werken in onze eigen gemeente en de omliggende gemeenten. Twijfelt u? Vraag het gerust.',
		show_on_home: true,
		// The client supplies the service area first (docs/cms-plan/12-open-items.md).
		is_published: false
	},
	{
		question: 'Is een offerte gratis?',
		answer: 'Ja. U krijgt een duidelijke offerte, helemaal gratis en zonder verplichtingen.',
		show_on_home: true,
		is_published: true
	},
	{
		question: 'Wanneer verticuteert u een gazon het best?',
		answer:
			'Meestal in het voorjaar of het najaar, als het gras goed groeit. Wij bekijken uw gazon en adviseren het juiste moment.',
		show_on_home: true,
		is_published: true,
		service: 'gazononderhoud'
	},
	{
		question: 'Werkt u ook voor bedrijven?',
		answer: 'Ja, wij werken voor particulieren en bedrijven, eenmalig of met periodiek onderhoud.',
		show_on_home: true,
		is_published: true
	}
].map((f, i) => ({
	...f,
	id: stableId(`faq:${i}`),
	sort_order: i,
	service_id: 'service' in f && f.service ? serviceId(f.service) : null
}));

// ---------------------------------------------------------------- settings

export const seedSettings = {
	company: {
		name: 'TuinZorg DP',
		email: 'info@tuinzorgdp.be',
		phone: '+32 469 41 37 30',
		whatsapp: '32469413730'
	},
	hours: {},
	geo: {},
	socials: {},
	google: {},
	maps_embed_url: null,
	notify_email: 'info@tuinzorgdp.be'
};

// ---------------------------------------------------------------- draft projects, one per photo group

const GROUPS: { folder: string; slug: string; title: string; service: string; summary: string }[] =
	[
		{
			folder: 'maaien',
			slug: 'maaien-en-gazons-strak-gemaaid',
			title: 'Gazons strak gemaaid',
			service: 'maaien-en-bosmaaien',
			summary: 'Gazons gemaaid op de juiste hoogte, met strakke strepen en nette randen.'
		},
		{
			folder: 'Verticuteren en grasmatten',
			slug: 'verticuteren-en-nieuwe-graszoden',
			title: 'Verticuteren en nieuwe graszoden',
			service: 'gazononderhoud',
			summary: 'Gazons geverticuteerd, oud gras afgepeld en nieuwe graszoden gelegd.'
		},
		{
			folder: 'Snoeien',
			slug: 'hagen-en-vormsnoei',
			title: 'Hagen en vormsnoei',
			service: 'snoeien',
			summary: 'Beukenhagen, ligusters en taxuszuilen strak in vorm gesnoeid.'
		},
		{
			folder: 'Lamellen',
			slug: 'lamellen-in-draadafsluiting',
			title: 'Lamellen in draadafsluiting',
			service: 'lamellen-plaatsen',
			summary:
				'Lamellen geplaatst in een draadafsluiting, rond een containerplaats en bij een poort.'
		},
		{
			folder: 'Plaatsen tuinafboording',
			slug: 'tuinafboording-en-cortenstaal',
			title: 'Tuinafboording en cortenstaal',
			service: 'tuinafboording',
			summary: 'Rechte en gebogen afboordingen, ook in cortenstaal, rond borders en terras.'
		},
		{
			folder: 'Invoeren substraten',
			slug: 'schors-en-grind-ingevoerd',
			title: 'Schors en grind ingevoerd',
			service: 'materialen-invoeren',
			summary: 'Borders en paden voorzien van houtschors en grind.'
		}
	];

/** The twelve photos of the design system's home gallery, in its order. */
export const HOME_GALLERY = [
	'maaien-gazon-ruim.jpg',
	'haag-gazon-ruim.jpg',
	'afboording-border-gebogen.jpg',
	'lamellen-poort.jpg',
	'grasmat-voor-na.jpg',
	'schors-voortuin.jpg',
	'haag-beuk-achtertuin.jpg',
	'verticuteren-rijen.jpg',
	'afboording-tuinhuis.jpg',
	'grind-pad-tuinhuis.jpg',
	'taxus-vormsnoei.jpg',
	'lamellen-containerplaats.jpg'
];

const ROLE_HINTS: Record<string, 'before' | 'after' | 'process'> = {
	'maaien-hoog-gras.jpg': 'before',
	'grasmat-voor-na.jpg': 'after',
	'afpelmachine.jpg': 'process',
	'gazon-afgepeld.jpg': 'process',
	'schors-aanhangwagen.jpg': 'process',
	'verticuteren-kruiwagen.jpg': 'process'
};

/** Photos that are not job results: the van (trust photos) and the one with the photographer's shadow. */
const NOT_IN_PROJECTS = new Set([
	'bestelwagen-aanhanger.jpg',
	'bestelwagen-oprit.jpg',
	'gazon-strepen-terras.jpg'
]);

export const seedProjects = GROUPS.map((g, i) => {
	const photos = seedMedia.filter(
		(m) => m.original_path.split('/')[1] === g.folder && !NOT_IN_PROJECTS.has(m.file_name)
	);
	const coverFile =
		photos.find((p) => HOME_GALLERY.includes(p.file_name))?.file_name ?? photos[0].file_name;
	return {
		id: stableId(`project:${g.slug}`),
		slug: g.slug,
		title: g.title,
		service_id: serviceId(g.service),
		summary: g.summary,
		cover_media_id: mediaId(coverFile),
		sort_order: i,
		is_published: false,
		photos: photos.map((p, n) => ({
			id: stableId(`project_media:${g.slug}:${p.file_name}`),
			media_id: p.id,
			role: ROLE_HINTS[p.file_name] ?? ('result' as const),
			in_home_gallery: HOME_GALLERY.includes(p.file_name),
			sort_order: n
		}))
	};
});

// ---------------------------------------------------------------- redirects from the WordPress site

export const seedRedirects = [
	{ from_path: '/ons-werk', to_path: '/realisaties', note: 'WordPress-pagina' },
	{ from_path: '/ons-werk/', to_path: '/realisaties', note: 'WordPress-pagina' }
].map((r) => ({ ...r, id: stableId(`redirect:${r.from_path}`), status: 301 }));
