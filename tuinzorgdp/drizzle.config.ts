import { defineConfig } from 'drizzle-kit';

// Generating migrations needs no database; applying them does (npm run db:migrate, with the owner role).
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL_MIGRATE ?? process.env.DATABASE_URL ?? '' },
	verbose: true,
	strict: true
});
