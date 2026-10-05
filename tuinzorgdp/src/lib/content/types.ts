/** View models the public components render. Built from Neon rows (or the seed fallback) by server/content.ts. */
import type { IconName } from '$lib/icons/icons';

export type Media = {
	id: string;
	width: number;
	height: number;
	alt: string;
	focalX: number;
	focalY: number;
	/** Set only in the CMS preview, where images come from storage instead of the build output. */
	src?: string;
};

export type ServiceIconName =
	'mower' | 'grass' | 'shovel' | 'scissors' | 'fence' | 'ruler' | 'layers';

export type Service = {
	id: string;
	slug: string;
	title: string;
	shortLabel: string;
	subtitle: string | null;
	summary: string;
	bodyHtml: string;
	bullets: string[];
	icon: ServiceIconName & IconName;
	cover: Media | null;
	featured: boolean;
	seoTitle: string | null;
	metaDescription: string | null;
};

export type PhotoRole = 'before' | 'after' | 'process' | 'result';

export type GalleryPhoto = {
	media: Media;
	title: string;
	category: string;
	serviceSlug: string;
	projectSlug: string;
	areaSlug: string | null;
	role: PhotoRole;
	inHome: boolean;
};

export type Area = {
	id: string;
	name: string;
	slug: string;
	postcode: string | null;
	isPrimary: boolean;
	introHtml: string;
	introText: string;
	seoTitle: string | null;
	metaDescription: string | null;
};

export type Project = {
	id: string;
	slug: string;
	title: string;
	service: { slug: string; title: string; shortLabel: string };
	area: { name: string; slug: string } | null;
	summary: string | null;
	bodyHtml: string;
	cover: Media | null;
	completedOn: string | null;
	featured: boolean;
	photos: { media: Media; role: PhotoRole }[];
	seoTitle: string | null;
	metaDescription: string | null;
};

export type Review = {
	id: string;
	quote: string;
	author: string;
	place: string | null;
	rating: number;
	source: 'google' | 'direct';
	sourceUrl: string | null;
	reviewedOn: string | null;
};

export type Faq = {
	id: string;
	question: string;
	answer: string;
	serviceSlug: string | null;
	showOnHome: boolean;
};

export type SocialPost = {
	id: string;
	network: 'instagram' | 'facebook';
	url: string;
	media: Media | null;
	caption: string | null;
};

export type SiteSettings = {
	company: {
		name: string;
		street?: string;
		postcode?: string;
		city?: string;
		region?: string;
		vat?: string;
		email?: string;
		phone?: string;
		whatsapp?: string;
		showStreet?: boolean;
	};
	hours: { label?: string; days?: string[]; opens?: string; closes?: string };
	geo: { lat?: number; lng?: number };
	socials: { instagram?: string; facebook?: string };
	google: {
		placeId?: string;
		profileUrl?: string;
		writeReviewUrl?: string;
		rating?: number;
		ratingCount?: number;
		checkedOn?: string;
	};
	mapsEmbedUrl: string | null;
};

export type HomeBlocks = {
	hero: { title: string; accentWord: string; lead: string; usps: string[] };
	about: {
		eyebrow: string;
		title: string;
		accentWord: string;
		lead: string;
		perks: { title: string; text: string }[];
		mediaIds: string[];
	};
	cta: { title: string; accentWord: string; lead: string };
};

export type Page = {
	slug: string;
	title: string;
	intro: string | null;
	bodyHtml: string;
	blocks: Record<string, unknown>;
	hero: Media | null;
	seoTitle: string | null;
	metaDescription: string | null;
	noindex: boolean;
};

export type SiteContent = {
	settings: SiteSettings;
	pages: Record<string, Page>;
	home: HomeBlocks & { aboutMedia: (Media | null)[] };
	services: Service[];
	projects: Project[];
	gallery: GalleryPhoto[];
	reviews: Review[];
	faqs: Faq[];
	areas: Area[];
	social: SocialPost[];
	redirects: { from: string; to: string; status: number }[];
	contactMedia: Media | null;
};
