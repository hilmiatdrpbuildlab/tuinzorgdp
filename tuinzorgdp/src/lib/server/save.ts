import { deleteIfUnused } from './cms';
import type { Db } from './db/client';
import { storage } from './storage';

/**
 * Runs a CMS save in one transaction (the row and its media_usages together), then deletes the files
 * the save stopped using. The transaction returns the dropped media ids.
 */
export async function saveTx(db: Db, fn: (tx: Db) => Promise<string[] | void>): Promise<void> {
	const dropped = (await db.transaction(
		async (tx) => (await fn(tx as unknown as Db)) ?? []
	)) as string[];
	if (dropped.length) await deleteIfUnused(db, await storage(), dropped);
}

/** Postgres error codes the CMS turns into Dutch messages. */
export function dbMessage(e: unknown): string {
	const err = e as {
		code?: string;
		cause?: { code?: string };
		constraint?: string;
		message?: string;
	};
	const code = err.code ?? err.cause?.code;
	const msg = `${err.message ?? ''} ${err.constraint ?? ''}`;
	if (code === '23505' && /slug/.test(msg)) return 'Deze slug bestaat al. Kies een andere.';
	if (code === '23505' && /featured/.test(msg)) return 'Er kan maar één uitgelichte dienst zijn.';
	if (code === '23505') return 'Dit bestaat al.';
	if (code === '23503') return 'Dit wordt nog gebruikt en kan niet verwijderd worden.';
	if (code === '23514' && /len/.test(msg)) return 'Een tekst is te lang.';
	if (code === '23514' && /consent/.test(msg))
		return 'Vink eerst aan dat de klant toestemming gaf.';
	return 'Opslaan is niet gelukt. Probeer opnieuw.';
}
