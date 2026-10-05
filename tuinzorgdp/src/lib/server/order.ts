import { eq } from 'drizzle-orm';
import { requireUser, markChanged } from './cms';
import * as schema from './db/schema';
import { fields } from './form';

type Orderable =
	| typeof schema.services
	| typeof schema.projects
	| typeof schema.reviews
	| typeof schema.faqs
	| typeof schema.serviceAreas
	| typeof schema.socialPosts;

/** The `?/order` action of a list screen: writes sort_order from the dragged order. */
export function orderAction(table: Orderable, tableName: string, label: string) {
	return async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		requireUser(locals);
		const ids = fields(await request.formData())
			.json<string[]>('ids', [])
			.filter((x) => typeof x === 'string');
		const db = await locals.db();
		for (const [i, id] of ids.entries()) {
			/* eslint-disable @typescript-eslint/no-explicit-any -- the tables share id and sort_order */
			await db
				.update(table as any)
				.set({ sort_order: i })
				.where(eq((table as any).id, id));
			/* eslint-enable @typescript-eslint/no-explicit-any */
		}
		await markChanged(db, tableName, 'volgorde', `Volgorde ${label}`);
		return { ok: true };
	};
}
