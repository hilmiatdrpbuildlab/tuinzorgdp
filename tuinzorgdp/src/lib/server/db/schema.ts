/**
 * The database schema (docs/cms-plan/03-database.md). Drizzle Kit generates the SQL migrations in
 * drizzle/ from this file. Column names are English snake_case; everything people see is Dutch.
 */
import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	date,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	real,
	smallint,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

const timestamps = {
	created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
};

const seo = {
	seo_title: text('seo_title'),
	meta_description: text('meta_description')
};

const seoChecks = (t: { seo_title: unknown; meta_description: unknown }, name: string) => [
	check(`${name}_seo_title_len`, sql`char_length(${t.seo_title}) <= 62`),
	check(`${name}_meta_description_len`, sql`char_length(${t.meta_description}) <= 158`)
];

export const serviceIcon = pgEnum('service_icon', [
	'mower',
	'grass',
	'shovel',
	'scissors',
	'fence',
	'ruler',
	'layers',
	'trees'
]);
export const photoRole = pgEnum('photo_role', ['before', 'after', 'process', 'result']);
export const reviewSource = pgEnum('review_source', ['google', 'direct']);
export const socialNetwork = pgEnum('social_network', ['instagram', 'facebook']);
export const requestKind = pgEnum('request_kind', ['offerte', 'vraag']);
export const requestStatus = pgEnum('request_status', [
	'nieuw',
	'beantwoord',
	'gepland',
	'archief'
]);
export const buildStatus = pgEnum('build_status', ['pending', 'building', 'live', 'failed']);
export const buildTrigger = pgEnum('build_trigger', ['cms', 'cron', 'push']);

// ---------------------------------------------------------------- media

export type MediaVariants = { widths: number[]; format: 'webp' };

export const media = pgTable('media', {
	id: uuid('id').primaryKey().defaultRandom(),
	object_key: text('object_key').notNull().unique(),
	file_name: text('file_name').notNull(),
	mime: text('mime').notNull(),
	bytes: integer('bytes').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	alt: text('alt').notNull().default(''),
	focal_x: real('focal_x').notNull().default(0.5),
	focal_y: real('focal_y').notNull().default(0.5),
	variants: jsonb('variants').$type<MediaVariants | null>(),
	...timestamps
});

export const mediaUsages = pgTable(
	'media_usages',
	{
		media_id: uuid('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'restrict' }),
		owner_table: text('owner_table').notNull(),
		owner_id: text('owner_id').notNull(),
		field: text('field').notNull()
	},
	(t) => [
		primaryKey({ columns: [t.media_id, t.owner_table, t.owner_id, t.field] }),
		index('media_usages_owner_idx').on(t.owner_table, t.owner_id)
	]
);

// ---------------------------------------------------------------- content

export const pages = pgTable(
	'pages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		intro: text('intro'),
		body: text('body'),
		blocks: jsonb('blocks').$type<Record<string, unknown>>().notNull().default({}),
		hero_media_id: uuid('hero_media_id').references(() => media.id, { onDelete: 'set null' }),
		noindex: boolean('noindex').notNull().default(false),
		...seo,
		...timestamps
	},
	(t) => seoChecks(t, 'pages')
);

export const services = pgTable(
	'services',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		short_label: text('short_label').notNull(),
		subtitle: text('subtitle'),
		summary: text('summary').notNull(),
		body: text('body'),
		bullets: jsonb('bullets').$type<string[]>().notNull().default([]),
		icon: serviceIcon('icon').notNull(),
		cover_media_id: uuid('cover_media_id').references(() => media.id, { onDelete: 'set null' }),
		is_featured: boolean('is_featured').notNull().default(false),
		sort_order: integer('sort_order').notNull().default(0),
		is_published: boolean('is_published').notNull().default(true),
		...seo,
		...timestamps
	},
	(t) => [
		uniqueIndex('services_one_featured')
			.on(t.is_featured)
			.where(sql`${t.is_featured}`),
		check('services_summary_len', sql`char_length(${t.summary}) <= 160`),
		check('services_bullets_max', sql`jsonb_array_length(${t.bullets}) <= 6`),
		...seoChecks(t, 'services')
	]
);

export const serviceAreas = pgTable(
	'service_areas',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		slug: text('slug').notNull().unique(),
		postcode: text('postcode'),
		is_primary: boolean('is_primary').notNull().default(false),
		intro: text('intro'),
		sort_order: integer('sort_order').notNull().default(0),
		is_published: boolean('is_published').notNull().default(false),
		...seo,
		...timestamps
	},
	(t) => seoChecks(t, 'service_areas')
);

export const projects = pgTable(
	'projects',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		service_id: uuid('service_id')
			.notNull()
			.references(() => services.id, { onDelete: 'restrict' }),
		service_area_id: uuid('service_area_id').references(() => serviceAreas.id, {
			onDelete: 'set null'
		}),
		summary: text('summary'),
		body: text('body'),
		cover_media_id: uuid('cover_media_id').references(() => media.id, { onDelete: 'set null' }),
		completed_on: date('completed_on'),
		is_featured: boolean('is_featured').notNull().default(false),
		sort_order: integer('sort_order').notNull().default(0),
		is_published: boolean('is_published').notNull().default(false),
		...seo,
		...timestamps
	},
	(t) => seoChecks(t, 'projects')
);

export const projectMedia = pgTable(
	'project_media',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		project_id: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		media_id: uuid('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'restrict' }),
		role: photoRole('role').notNull().default('result'),
		in_home_gallery: boolean('in_home_gallery').notNull().default(false),
		sort_order: integer('sort_order').notNull().default(0),
		...timestamps
	},
	(t) => [uniqueIndex('project_media_unique').on(t.project_id, t.media_id)]
);

export const reviews = pgTable(
	'reviews',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		quote: text('quote').notNull(),
		author_name: text('author_name').notNull(),
		place: text('place'),
		service_id: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
		rating: smallint('rating').notNull().default(5),
		source: reviewSource('source').notNull().default('direct'),
		source_url: text('source_url'),
		reviewed_on: date('reviewed_on'),
		consent_confirmed: boolean('consent_confirmed').notNull().default(false),
		sort_order: integer('sort_order').notNull().default(0),
		is_published: boolean('is_published').notNull().default(false),
		...timestamps
	},
	(t) => [
		check('reviews_rating_range', sql`${t.rating} between 1 and 5`),
		check('reviews_consent_before_publish', sql`not ${t.is_published} or ${t.consent_confirmed}`)
	]
);

export const faqs = pgTable('faqs', {
	id: uuid('id').primaryKey().defaultRandom(),
	question: text('question').notNull(),
	answer: text('answer').notNull(),
	service_id: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
	show_on_home: boolean('show_on_home').notNull().default(false),
	sort_order: integer('sort_order').notNull().default(0),
	is_published: boolean('is_published').notNull().default(true),
	...timestamps
});

export const socialPosts = pgTable('social_posts', {
	id: uuid('id').primaryKey().defaultRandom(),
	network: socialNetwork('network').notNull(),
	url: text('url').notNull(),
	media_id: uuid('media_id').references(() => media.id, { onDelete: 'set null' }),
	caption: text('caption'),
	posted_on: date('posted_on'),
	sort_order: integer('sort_order').notNull().default(0),
	is_published: boolean('is_published').notNull().default(false),
	...timestamps
});

export type Company = {
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
export type Hours = { label?: string; days?: string[]; opens?: string; closes?: string };
export type Geo = { lat?: number; lng?: number };
export type Socials = { instagram?: string; facebook?: string };
export type GoogleSettings = {
	placeId?: string;
	profileUrl?: string;
	writeReviewUrl?: string;
	rating?: number;
	ratingCount?: number;
	checkedOn?: string;
	source?: 'places' | 'manual';
};

export const settings = pgTable(
	'settings',
	{
		id: boolean('id').primaryKey().default(true),
		company: jsonb('company').$type<Company>().notNull(),
		hours: jsonb('hours').$type<Hours>().notNull().default({}),
		geo: jsonb('geo').$type<Geo>().notNull().default({}),
		socials: jsonb('socials').$type<Socials>().notNull().default({}),
		google: jsonb('google').$type<GoogleSettings>().notNull().default({}),
		maps_embed_url: text('maps_embed_url'),
		notify_email: text('notify_email').notNull().default('info@tuinzorgdp.be'),
		...timestamps
	},
	(t) => [check('settings_single_row', sql`${t.id}`)]
);

export const redirects = pgTable(
	'redirects',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		from_path: text('from_path').notNull().unique(),
		to_path: text('to_path').notNull(),
		status: smallint('status').notNull().default(301),
		note: text('note'),
		...timestamps
	},
	(t) => [check('redirects_status', sql`${t.status} in (301, 302)`)]
);

/** Every CMS save or delete adds a row; the publish banner counts rows newer than the last live build. */
export const contentChanges = pgTable(
	'content_changes',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		owner_table: text('owner_table').notNull(),
		owner_id: text('owner_id').notNull(),
		label: text('label').notNull(),
		action: text('action').notNull(),
		changed_at: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('content_changes_changed_at_idx').on(t.changed_at)]
);

// ---------------------------------------------------------------- requests (never read by the build)

export const requests = pgTable(
	'requests',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		kind: requestKind('kind').notNull(),
		first_name: text('first_name').notNull(),
		last_name: text('last_name'),
		email: text('email').notNull(),
		phone: text('phone'),
		street: text('street'),
		postcode: text('postcode'),
		municipality: text('municipality'),
		services: text('services')
			.array()
			.notNull()
			.default(sql`'{}'::text[]`),
		timing: text('timing'),
		garden_size: text('garden_size'),
		message: text('message').notNull(),
		consent_at: timestamp('consent_at', { withTimezone: true }),
		status: requestStatus('status').notNull().default('nieuw'),
		notified_at: timestamp('notified_at', { withTimezone: true }),
		created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updated_at: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(t) => [index('requests_created_at_idx').on(t.created_at)]
);

export const requestFiles = pgTable('request_files', {
	id: uuid('id').primaryKey().defaultRandom(),
	request_id: uuid('request_id')
		.notNull()
		.references(() => requests.id, { onDelete: 'cascade' }),
	object_key: text('object_key').notNull(),
	mime: text('mime').notNull(),
	bytes: integer('bytes').notNull(),
	width: integer('width'),
	height: integer('height'),
	created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

/**
 * The 10-minute submission window (5 per IP). Cloudflare's rate-limit binding only allows 10 s or 60 s
 * periods. Holds an HMAC of the IP and the hour, never the IP, and rows older than 10 minutes are deleted.
 */
export const submitAttempts = pgTable(
	'submit_attempts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		key_hash: text('key_hash').notNull(),
		created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('submit_attempts_key_idx').on(t.key_hash, t.created_at)]
);

export const builds = pgTable('builds', {
	id: uuid('id').primaryKey().defaultRandom(),
	status: buildStatus('status').notNull().default('pending'),
	trigger: buildTrigger('trigger').notNull(),
	triggered_at: timestamp('triggered_at', { withTimezone: true }).notNull().defaultNow(),
	finished_at: timestamp('finished_at', { withTimezone: true }),
	build_uuid: text('build_uuid'),
	detail: text('detail')
});

// ---------------------------------------------------------------- Better Auth (user, session, account, verification, two_factor)

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	twoFactorEnabled: boolean('two_factor_enabled').default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const twoFactor = pgTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	verified: boolean('verified').default(true),
	failedVerificationCount: integer('failed_verification_count').default(0),
	lockedUntil: timestamp('locked_until', { withTimezone: true })
});

/** Tables the publish banner and the build read. Requests and auth are never part of this list. */
export const CONTENT_TABLES = [
	'pages',
	'services',
	'projects',
	'project_media',
	'reviews',
	'faqs',
	'service_areas',
	'social_posts',
	'media',
	'media_usages',
	'settings',
	'redirects'
] as const;
