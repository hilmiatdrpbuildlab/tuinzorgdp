-- updated_at is set by a trigger on every content table, so edits made outside the app count too.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
	FOREACH t IN ARRAY ARRAY['media','pages','services','service_areas','projects','project_media','reviews','faqs','social_posts','settings','redirects','requests']
	LOOP
		EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', t, t);
		EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
	END LOOP;
END $$;
--> statement-breakpoint
-- Grants for the three roles (docs/cms-plan/08-security.md). The roles are created in the Neon console;
-- where a role does not exist (local PGlite, a fresh branch) its grants are skipped.
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tz_app') THEN
		GRANT USAGE ON SCHEMA public TO tz_app;
		GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tz_app;
		GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tz_app;
		ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tz_app;
	END IF;
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tz_build') THEN
		GRANT USAGE ON SCHEMA public TO tz_build;
		GRANT SELECT ON media, media_usages, pages, services, service_areas, projects, project_media,
			reviews, faqs, social_posts, settings, redirects, builds TO tz_build;
		-- The build records its own publish row (scripts/write-build-files.ts, mark-live.ts) and nothing else.
		GRANT INSERT, UPDATE (status, finished_at, build_uuid, detail) ON builds TO tz_build;
		REVOKE ALL ON requests, request_files, submit_attempts, "user", session, account, verification, two_factor FROM tz_build;
	END IF;
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tz_backup') THEN
		GRANT USAGE ON SCHEMA public TO tz_backup;
		GRANT SELECT ON ALL TABLES IN SCHEMA public TO tz_backup;
		ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO tz_backup;
	END IF;
END $$;
