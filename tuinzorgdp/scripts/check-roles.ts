/**
 * Phase 0 check: the three roles connect, tz_build and tz_backup are refused an INSERT, and
 * tz_build cannot read requests. Uses DATABASE_URL (tz_app), DATABASE_URL_BUILD and BACKUP_DATABASE_URL.
 */
import { neon } from '@neondatabase/serverless';
import { env } from './lib/env';

async function probe(
	label: string,
	url: string | undefined,
	expectWrite: boolean,
	expectRequests: boolean
) {
	if (!url) return console.log(`${label}: not set, skipped`);
	const sql = neon(url);
	await sql`select 1`;
	let wrote = true;
	try {
		await sql`insert into redirects (from_path, to_path, note) values ('/__role-check', '/', 'role check')`;
		await sql`delete from redirects where from_path = '/__role-check'`;
	} catch {
		wrote = false;
	}
	let readRequests = true;
	try {
		await sql`select count(*) from requests`;
	} catch {
		readRequests = false;
	}
	const ok = wrote === expectWrite && readRequests === expectRequests;
	console.log(
		`${label}: connects, insert ${wrote ? 'allowed' : 'refused'}, requests ${readRequests ? 'readable' : 'refused'} ${ok ? 'OK' : 'FAIL'}`
	);
	if (!ok) process.exitCode = 1;
}

await probe('tz_app', env('DATABASE_URL'), true, true);
await probe('tz_build', env('DATABASE_URL_BUILD'), false, false);
await probe('tz_backup', env('BACKUP_DATABASE_URL'), false, true);
