/**
 * Content rows to the view models of the public site. Free of SvelteKit imports, so the build
 * scripts (build-images, verify-build) use the same code. site.ts picks Neon or the seed.
 * The CMS preview calls buildContent with drafts = true to render unpublished rows.
 */
import { asc } from 'drizzle-orm';
import type {
	Area,
	Faq,
	GalleryPhoto,
	HomeBlocks,
	Media,
	Page,
	Project,
	Review,
	Service,
	SiteContent,
	SocialPost
} from '$lib/content/types';
import { LIMITS, wordCount } from '../rules';
import type { Db } from './db/client';
import * as schema from './db/schema';
import { plainText, renderMarkdown } from './markdown';
import {
	HOME_GALLERY,
	seedFaqs,
	seedMedia,
	seedPages,
	seedProjects,
	seedRedirects,
	seedServices,
	seedSettings
} from './seed-data';

type Row<T extends keyof typeof schema> = (typeof schema)[T] extends { $inferSelect: infer R }
	? R
	: never;

export type RawContent = {
	settings: Row<'settings'> | null;
	pages: Row<'pages'>[];
	services: Row<'services'>[];
	areas: Row<'serviceAreas'>[];
	projects: Row<'projects'>[];
	projectMedia: Row<'projectMedia'>[];
	reviews: Row<'reviews'>[];
	faqs: Row<'faqs'>[];
	social: Row<'socialPosts'>[];
	media: Row<'media'>[];
	redirects: Row<'redirects'>[];
};

export async function readRaw(db: Db): Promise<RawContent> {
	const [
		settingsRows,
		pages,
		services,
		areas,
		projects,
		projectMedia,
		reviews,
		faqs,
		social,
		media,
		redirects
	] = await Promise.all([
		db.select().from(schema.settings),
		db.select().from(schema.pages),
		db.select().from(schema.services).orderBy(asc(schema.services.sort_order)),
		db.select().from(schema.serviceAreas).orderBy(asc(schema.serviceAreas.sort_order)),
		db.select().from(schema.projects).orderBy(asc(schema.projects.sort_order)),
		db.select().from(schema.projectMedia).orderBy(asc(schema.projectMedia.sort_order)),
		db.select().from(schema.reviews).orderBy(asc(schema.reviews.sort_order)),
		db.select().from(schema.faqs).orderBy(asc(schema.faqs.sort_order)),
		db.select().from(schema.socialPosts).orderBy(asc(schema.socialPosts.sort_order)),
		db.select().from(schema.media),
		db.select().from(schema.redirects)
	]);
	return {
		settings: settingsRows[0] ?? null,
		pages,
		services,
		areas,
		projects,
		projectMedia,
		reviews,
		faqs,
		social,
		media,
		redirects
	};
}

/** The seed content as database rows. Draft projects are published here so an offline build shows the gallery. */
export function seedRaw(): RawContent {
	const now = new Date('2026-10-05T08:00:00Z');
	const ts = { created_at: now, updated_at: now };
	const seo = { seo_title: null, meta_description: null };
	return {
		settings: { id: true, ...seedSettings, ...ts },
		pages: seedPages.map((p) => ({
			id: p.id,
			slug: p.slug,
			title: p.title,
			intro: p.intro,
			body: p.body,
			blocks: p.blocks,
			hero_media_id: p.hero ? (seedMedia.find((m) => m.file_name === p.hero)?.id ?? null) : null,
			noindex: false,
			seo_title: p.seo_title,
			meta_description: p.meta_description,
			...ts
		})),
		services: seedServices.map((s) => ({
			id: s.id,
			slug: s.slug,
			title: s.title,
			short_label: s.short_label,
			subtitle: s.subtitle,
			summary: s.summary,
			body: s.body,
			bullets: s.bullets,
			icon: s.icon,
			cover_media_id: s.cover ? (seedMedia.find((m) => m.file_name === s.cover)?.id ?? null) : null,
			is_featured: s.is_featured,
			sort_order: s.sort_order,
			is_published: true,
			...seo,
			...ts
		})),
		areas: [],
		projects: seedProjects.map((p) => ({
			id: p.id,
			slug: p.slug,
			title: p.title,
			service_id: p.service_id,
			service_area_id: null,
			summary: p.summary,
			body: null,
			cover_media_id: p.cover_media_id,
			completed_on: null,
			is_featured: false,
			sort_order: p.sort_order,
			is_published: true,
			...seo,
			...ts
		})),
		projectMedia: seedProjects.flatMap((p) =>
			p.photos.map((ph) => {
				const file = seedMedia.find((m) => m.id === ph.media_id)?.file_name ?? '';
				const rank = HOME_GALLERY.indexOf(file);
				// Newest first: the home gallery keeps the design system's order.
				const created = new Date(now.getTime() - (rank === -1 ? 1000 : rank) * 60_000);
				return {
					id: ph.id,
					project_id: p.id,
					media_id: ph.media_id,
					role: ph.role,
					in_home_gallery: ph.in_home_gallery,
					sort_order: ph.sort_order,
					created_at: created,
					updated_at: created
				};
			})
		),
		reviews: [],
		faqs: seedFaqs.map((f) => ({
			id: f.id,
			question: f.question,
			answer: f.answer,
			service_id: f.service_id,
			show_on_home: f.show_on_home,
			sort_order: f.sort_order,
			is_published: f.is_published,
			...ts
		})),
		social: [],
		media: seedMedia.map((m) => ({
			id: m.id,
			object_key: `ds:${m.source_path}`,
			file_name: m.file_name,
			mime: 'image/jpeg',
			bytes: 0,
			width: m.width,
			height: m.height,
			alt: m.alt,
			focal_x: 0.5,
			focal_y: m.focal_y ?? 0.5,
			variants: null,
			...ts
		})),
		redirects: seedRedirects.map((r) => ({ ...r, ...ts }))
	};
}

type Options = { drafts?: boolean; mediaSrc?: (row: Row<'media'>) => string | undefined };

export function buildContent(raw: RawContent, opts: Options = {}): SiteContent {
	const drafts = !!opts.drafts;
	const mediaById = new Map(raw.media.map((m) => [m.id, m]));
	const toMedia = (id: string | null | undefined): Media | null => {
		if (!id) return null;
		const m = mediaById.get(id);
		if (!m) return null;
		return {
			id: m.id,
			width: m.width,
			height: m.height,
			alt: m.alt,
			focalX: m.focal_x,
			focalY: m.focal_y,
			src: opts.mediaSrc?.(m)
		};
	};

	const services: Service[] = raw.services
		.filter((s) => drafts || s.is_published)
		.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order)
		.map((s) => ({
			id: s.id,
			slug: s.slug,
			title: s.title,
			shortLabel: s.short_label,
			subtitle: s.subtitle,
			summary: s.summary,
			bodyHtml: renderMarkdown(s.body),
			bullets: s.bullets ?? [],
			icon: s.icon,
			cover: toMedia(s.cover_media_id),
			featured: s.is_featured,
			seoTitle: s.seo_title,
			metaDescription: s.meta_description
		}));
	const serviceById = new Map(services.map((s) => [s.id, s]));

	const areas: Area[] = raw.areas
		.filter((a) => drafts || (a.is_published && wordCount(a.intro) >= LIMITS.areaIntroWords))
		.map((a) => ({
			id: a.id,
			name: a.name,
			slug: a.slug,
			postcode: a.postcode,
			isPrimary: a.is_primary,
			introHtml: renderMarkdown(a.intro),
			introText: plainText(a.intro),
			seoTitle: a.seo_title,
			metaDescription: a.meta_description
		}));
	const areaById = new Map(areas.map((a) => [a.id, a]));

	const photosByProject = new Map<string, Row<'projectMedia'>[]>();
	for (const pm of raw.projectMedia) {
		const list = photosByProject.get(pm.project_id) ?? [];
		list.push(pm);
		photosByProject.set(pm.project_id, list);
	}

	const projects: Project[] = raw.projects
		.filter((p) => serviceById.has(p.service_id))
		.filter((p) => {
			if (drafts) return true;
			const photos = (photosByProject.get(p.id) ?? []).filter((pm) => mediaById.has(pm.media_id));
			return (
				p.is_published && !!p.cover_media_id && mediaById.has(p.cover_media_id) && photos.length > 0
			);
		})
		.map((p) => {
			const svc = serviceById.get(p.service_id)!;
			const area = p.service_area_id ? areaById.get(p.service_area_id) : undefined;
			return {
				id: p.id,
				slug: p.slug,
				title: p.title,
				service: { slug: svc.slug, title: svc.title, shortLabel: svc.shortLabel },
				area: area ? { name: area.name, slug: area.slug } : null,
				summary: p.summary,
				bodyHtml: renderMarkdown(p.body),
				cover: toMedia(p.cover_media_id),
				completedOn: p.completed_on,
				featured: p.is_featured,
				photos: (photosByProject.get(p.id) ?? [])
					.sort((a, b) => a.sort_order - b.sort_order)
					.map((pm) => ({ media: toMedia(pm.media_id), role: pm.role }))
					.filter((x): x is { media: Media; role: typeof x.role } => !!x.media),
				seoTitle: p.seo_title,
				metaDescription: p.meta_description
			};
		});
	const projectById = new Map(projects.map((p) => [p.id, p]));
	const rawProjectById = new Map(raw.projects.map((p) => [p.id, p]));

	// All published photos, newest first: the home page takes the first 12 marked for it.
	const gallery: GalleryPhoto[] = raw.projectMedia
		.filter((pm) => projectById.has(pm.project_id) && mediaById.has(pm.media_id))
		.sort((a, b) => b.created_at.getTime() - a.created_at.getTime() || a.sort_order - b.sort_order)
		.map((pm) => {
			const p = projectById.get(pm.project_id)!;
			const areaId = rawProjectById.get(pm.project_id)?.service_area_id;
			return {
				media: toMedia(pm.media_id)!,
				title: p.title,
				category: p.service.shortLabel,
				serviceSlug: p.service.slug,
				projectSlug: p.slug,
				areaSlug: areaId ? (areaById.get(areaId)?.slug ?? null) : null,
				role: pm.role,
				inHome: pm.in_home_gallery
			};
		});

	const reviews: Review[] = raw.reviews
		.filter((r) => drafts || (r.is_published && r.consent_confirmed))
		.map((r) => ({
			id: r.id,
			quote: r.quote,
			author: r.author_name,
			place: r.place,
			rating: r.rating,
			source: r.source,
			sourceUrl: r.source_url,
			reviewedOn: r.reviewed_on
		}));

	const faqs: Faq[] = raw.faqs
		.filter((f) => drafts || f.is_published)
		.map((f) => ({
			id: f.id,
			question: f.question,
			answer: f.answer,
			serviceSlug: f.service_id ? (serviceById.get(f.service_id)?.slug ?? null) : null,
			showOnHome: f.show_on_home
		}));

	const social: SocialPost[] = raw.social
		.filter((s) => drafts || s.is_published)
		.sort(
			(a, b) => (b.posted_on ?? '').localeCompare(a.posted_on ?? '') || a.sort_order - b.sort_order
		)
		.slice(0, LIMITS.socialPosts)
		.map((s) => ({
			id: s.id,
			network: s.network,
			url: s.url,
			media: toMedia(s.media_id),
			caption: s.caption
		}));

	const pages: Record<string, Page> = {};
	for (const p of raw.pages) {
		pages[p.slug] = {
			slug: p.slug,
			title: p.title,
			intro: p.intro,
			bodyHtml: renderMarkdown(p.body),
			blocks: p.blocks ?? {},
			hero: toMedia(p.hero_media_id),
			seoTitle: p.seo_title,
			metaDescription: p.meta_description,
			noindex: p.noindex
		};
	}

	const homeBlocks = (pages.home?.blocks ?? {}) as Partial<HomeBlocks>;
	const fallbackHome = seedPages.find((p) => p.slug === 'home')!.blocks as unknown as HomeBlocks;
	const home: HomeBlocks = {
		hero: { ...fallbackHome.hero, ...homeBlocks.hero },
		about: { ...fallbackHome.about, ...homeBlocks.about },
		cta: { ...fallbackHome.cta, ...homeBlocks.cta }
	};

	const s = raw.settings ?? { ...seedSettings };
	return {
		settings: {
			company: { ...seedSettings.company, ...s.company },
			hours: s.hours ?? {},
			geo: s.geo ?? {},
			socials: s.socials ?? {},
			google: s.google ?? {},
			mapsEmbedUrl: s.maps_embed_url ?? null
		},
		pages,
		home: { ...home, aboutMedia: (home.about.mediaIds ?? []).map((id) => toMedia(id)) },
		services,
		projects,
		gallery,
		reviews,
		faqs,
		areas,
		social,
		redirects: raw.redirects.map((r) => ({ from: r.from_path, to: r.to_path, status: r.status })),
		contactMedia: pages.contact?.hero ?? null
	};
}
