/**
 * Page data from content, shared by the prerendered routes and the CMS preview (which passes draft
 * content), so the preview renders exactly what the build will.
 */
import type { Tile } from '$lib/components/ServiceTiles.svelte';
import type { Media, SiteContent } from '$lib/content/types';
import { LIMITS } from '$lib/rules';
import {
	business,
	breadcrumbs,
	faqPage,
	imageGallery,
	service as serviceSchema
} from '$lib/schema-org';
import { ogImage, seoDescription, seoTitle } from '$lib/seo';

export type Site = {
	url: string;
	testSite: boolean;
	analyticsToken: string | null;
	turnstileSiteKey: string | null;
};

export function layoutData(content: SiteContent, site: Site) {
	const primary = content.areas.find((a) => a.isPrimary) ?? content.areas[0];
	const tiles: Tile[] = [
		...content.services.map((s) => ({ value: s.slug, label: s.shortLabel, icon: s.icon })),
		{ value: 'anders', label: 'Anders', icon: 'sprout' }
	];
	return {
		site,
		settings: content.settings,
		footer: {
			services: content.services.map((s) => ({ slug: s.slug, title: s.title })),
			areas: content.areas.map((a) => ({ slug: a.slug, name: a.name }))
		},
		tiles,
		areaLabel: primary
			? `${primary.name} en omstreken`
			: content.settings.company.region
				? `Heel ${content.settings.company.region}`
				: null
	};
}

const biz = (c: SiteContent, url: string) => business(url, c.settings, c.areas, c.services);

export function homeData(content: SiteContent, url: string) {
	const page = content.pages.home;
	const faqs = content.faqs.filter((f) => f.showOnHome);
	return {
		page: {
			title: seoTitle(page?.seoTitle, 'Tuinonderhoud met passie'),
			description: seoDescription(page?.metaDescription, content.home.hero.lead)
		},
		home: content.home,
		heroImage: page?.hero ?? null,
		services: content.services,
		gallery: content.gallery.filter((g) => g.inHome).slice(0, LIMITS.homeGallery),
		reviews: content.reviews.slice(0, LIMITS.homeReviews),
		social: content.social,
		faqs,
		contactMedia: content.contactMedia,
		schema: [biz(content, url), ...(faqs.length ? [faqPage(faqs)] : [])]
	};
}

export function dienstenData(content: SiteContent, url: string) {
	const page = content.pages.diensten;
	return {
		page: {
			title: seoTitle(page?.seoTitle, 'Diensten'),
			description: seoDescription(page?.metaDescription, page?.intro ?? ''),
			heading: page?.title ?? 'Alles voor een verzorgde tuin',
			intro: page?.intro ?? null
		},
		services: content.services,
		cta: content.home.cta,
		contactMedia: content.contactMedia,
		schema: [
			biz(content, url),
			breadcrumbs(url, [
				{ name: 'Home', path: '/' },
				{ name: 'Diensten', path: '/diensten' }
			])
		]
	};
}

export function serviceData(content: SiteContent, url: string, slug: string) {
	const service = content.services.find((s) => s.slug === slug);
	if (!service) return null;
	const gallery = content.gallery.filter((g) => g.serviceSlug === service.slug);
	const faqs = content.faqs.filter((f) => f.serviceSlug === service.slug);
	const heroPhotos: Media[] = [];
	for (const m of [service.cover, ...gallery.map((g) => g.media)]) {
		if (m && !heroPhotos.some((x) => x.id === m.id)) heroPhotos.push(m);
	}
	return {
		page: {
			title: seoTitle(service.seoTitle, service.title),
			description: seoDescription(service.metaDescription, service.summary),
			image: ogImage(service.cover)
		},
		service,
		heroPhotos: heroPhotos.slice(0, 3),
		gallery,
		faqs,
		schema: [
			biz(content, url),
			serviceSchema(url, service, content.areas, content.settings.company.region),
			breadcrumbs(url, [
				{ name: 'Home', path: '/' },
				{ name: 'Diensten', path: '/diensten' },
				{ name: service.title, path: `/diensten/${service.slug}` }
			]),
			...(faqs.length ? [faqPage(faqs)] : [])
		]
	};
}

export function realisatiesData(content: SiteContent, url: string) {
	const page = content.pages.realisaties;
	return {
		page: {
			title: seoTitle(page?.seoTitle, 'Realisaties'),
			description: seoDescription(page?.metaDescription, page?.intro ?? ''),
			heading: page?.title ?? 'Ons werk in uw buurt',
			intro: page?.intro ?? null
		},
		gallery: content.gallery,
		projects: content.projects.map((p) => ({
			slug: p.slug,
			title: p.title,
			summary: p.summary,
			cover: p.cover,
			service: p.service.shortLabel,
			area: p.area?.name ?? null
		})),
		cta: content.home.cta,
		schema: [
			biz(content, url),
			breadcrumbs(url, [
				{ name: 'Home', path: '/' },
				{ name: 'Realisaties', path: '/realisaties' }
			])
		]
	};
}

export function projectData(content: SiteContent, url: string, slug: string) {
	const project = content.projects.find((p) => p.slug === slug);
	if (!project) return null;
	const before = project.photos.find((p) => p.role === 'before')?.media ?? null;
	const after = project.photos.find((p) => p.role === 'after')?.media ?? null;
	const others = content.projects.filter((p) => p.slug !== project.slug);
	const related = [
		...others.filter((p) => p.service.slug === project.service.slug),
		...others.filter((p) => p.service.slug !== project.service.slug)
	]
		.slice(0, 3)
		.map((p) => ({ slug: p.slug, title: p.title, cover: p.cover, service: p.service.shortLabel }));
	const fallback = `${project.title}: ${project.service.title.toLowerCase()} door TuinZorg DP${project.area ? ` in ${project.area.name}` : ''}. ${project.summary ?? ''}`;
	return {
		page: {
			title: seoTitle(project.seoTitle, project.title),
			description: seoDescription(project.metaDescription, fallback),
			image: ogImage(project.cover)
		},
		project,
		pair: before && after ? { before, after } : null,
		gallery: content.gallery.filter((g) => g.projectSlug === project.slug),
		related,
		cta: content.home.cta,
		schema: [
			biz(content, url),
			imageGallery(url, project),
			breadcrumbs(url, [
				{ name: 'Home', path: '/' },
				{ name: 'Realisaties', path: '/realisaties' },
				{ name: project.title, path: `/realisaties/${project.slug}` }
			])
		]
	};
}

export function areaData(content: SiteContent, url: string, slug: string) {
	const area = content.areas.find((a) => a.slug === slug);
	if (!area) return null;
	const gallery = content.gallery.filter((g) => g.areaSlug === area.slug);
	const heading = `Tuinonderhoud in ${area.name}`;
	return {
		page: {
			title: seoTitle(area.seoTitle, heading),
			description: seoDescription(area.metaDescription, area.introText),
			heading
		},
		area,
		services: content.services,
		gallery,
		heroPhotos: gallery.slice(0, 3).map((g) => g.media),
		schema: [
			biz(content, url),
			breadcrumbs(url, [
				{ name: 'Home', path: '/' },
				{ name: heading, path: `/tuinonderhoud/${area.slug}` }
			])
		]
	};
}

export function contactData(content: SiteContent, url: string) {
	const page = content.pages.contact;
	const faqs = content.faqs.filter((f) => !f.serviceSlug);
	return {
		page: {
			title: seoTitle(page?.seoTitle, 'Contact en gratis offerte'),
			description: seoDescription(page?.metaDescription, page?.intro ?? ''),
			heading: page?.title ?? 'Vraag uw gratis offerte aan',
			intro: page?.intro ?? null
		},
		photo: page?.hero ?? null,
		faqs,
		schema: [
			biz(content, url),
			breadcrumbs(url, [
				{ name: 'Home', path: '/' },
				{ name: 'Contact', path: '/contact' }
			]),
			...(faqs.length ? [faqPage(faqs)] : [])
		]
	};
}

export function privacyData(content: SiteContent, url: string) {
	const page = content.pages.privacy;
	if (!page) return null;
	return {
		page: {
			title: seoTitle(page.seoTitle, page.title),
			description: seoDescription(page.metaDescription, page.intro ?? page.title),
			heading: page.title,
			intro: page.intro,
			bodyHtml: page.bodyHtml,
			noindex: page.noindex
		},
		schema: [biz(content, url)]
	};
}
