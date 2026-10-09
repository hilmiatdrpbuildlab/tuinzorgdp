/** JSON-LD for local SEO (docs/cms-plan/06-public-site.md). The NAP comes from settings only. */
import type { Area, Faq, Project, Service, SiteSettings } from '$lib/content/types';
import { hoursDays } from '$lib/hours-schema';

/** The published municipalities, or the region when none is published yet. */
function served(areas: Area[], region: string | undefined) {
	if (areas.length) return { areaServed: areas.map((a) => ({ '@type': 'City', name: a.name })) };
	return region ? { areaServed: { '@type': 'AdministrativeArea', name: region } } : {};
}

type Json = Record<string, unknown>;

export function business(
	siteUrl: string,
	s: SiteSettings,
	areas: Area[],
	services: Service[]
): Json {
	const c = s.company;
	const showStreet = !!c.street && c.showStreet !== false;
	const address =
		c.postcode || c.city
			? {
					'@type': 'PostalAddress',
					...(showStreet ? { streetAddress: c.street } : {}),
					...(c.postcode ? { postalCode: c.postcode } : {}),
					...(c.city ? { addressLocality: c.city } : {}),
					...(c.region ? { addressRegion: c.region } : {}),
					addressCountry: 'BE'
				}
			: undefined;
	const sameAs = [s.google.profileUrl, s.socials.facebook, s.socials.instagram].filter(Boolean);
	const days = hoursDays(s.hours);
	return {
		'@context': 'https://schema.org',
		'@type': 'LandscapingBusiness',
		'@id': `${siteUrl}/#business`,
		name: c.name,
		slogan: 'Tuinonderhoud met passie',
		url: `${siteUrl}/`,
		logo: `${siteUrl}/logo/tz-logo.svg`,
		image: `${siteUrl}/logo/tz-mark.svg`,
		...(c.phone ? { telephone: c.phone.replace(/\s/g, '') } : {}),
		...(c.email ? { email: c.email } : {}),
		...(address ? { address } : {}),
		...(typeof s.geo.lat === 'number' && typeof s.geo.lng === 'number'
			? { geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng } }
			: {}),
		...served(areas, c.region),
		...(days && s.hours.opens && s.hours.closes
			? {
					openingHoursSpecification: [
						{
							'@type': 'OpeningHoursSpecification',
							dayOfWeek: days,
							opens: s.hours.opens,
							closes: s.hours.closes
						}
					]
				}
			: {}),
		...(sameAs.length ? { sameAs } : {}),
		...(c.vat ? { vatID: c.vat.replace(/[\s.]/g, '') } : {}),
		...(typeof s.google.rating === 'number' && s.google.ratingCount
			? {
					aggregateRating: {
						'@type': 'AggregateRating',
						ratingValue: s.google.rating,
						reviewCount: s.google.ratingCount
					}
				}
			: {}),
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Diensten',
			itemListElement: services.map((sv) => ({
				'@type': 'Offer',
				itemOffered: { '@type': 'Service', name: sv.title, url: `${siteUrl}/diensten/${sv.slug}` }
			}))
		}
	};
}

export function service(siteUrl: string, sv: Service, areas: Area[], region?: string): Json {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: sv.title,
		description: sv.summary,
		url: `${siteUrl}/diensten/${sv.slug}`,
		provider: { '@id': `${siteUrl}/#business` },
		...served(areas, region)
	};
}

export function faqPage(faqs: Faq[]): Json {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((f) => ({
			'@type': 'Question',
			name: f.question,
			acceptedAnswer: { '@type': 'Answer', text: f.answer }
		}))
	};
}

export function breadcrumbs(siteUrl: string, items: { name: string; path: string }[]): Json {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((it, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: it.name,
			item: `${siteUrl}${it.path}`
		}))
	};
}

export function imageGallery(siteUrl: string, p: Project): Json {
	return {
		'@context': 'https://schema.org',
		'@type': 'ImageGallery',
		name: p.title,
		url: `${siteUrl}/realisaties/${p.slug}`,
		image: p.photos.map((ph) => ({
			'@type': 'ImageObject',
			contentUrl: `${siteUrl}/media/${ph.media.id}-${Math.min(ph.media.width, 1600)}.webp`,
			caption: ph.media.alt
		}))
	};
}

/** Serialises JSON-LD for a <script> tag without allowing `</script>` breakouts. */
export function jsonLd(data: Json | Json[]): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
