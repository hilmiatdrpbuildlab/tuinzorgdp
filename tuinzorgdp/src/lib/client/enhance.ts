import type { SubmitFunction } from '@sveltejs/kit';
import { toast } from '$lib/components/toast.svelte';

/** use:enhance for CMS editors: keeps the typed values, shows "Opgeslagen" and tracks the busy state. */
export function saving(setBusy: (b: boolean) => void): SubmitFunction {
	return () => {
		setBusy(true);
		return async ({ result, update }) => {
			await update({ reset: false });
			setBusy(false);
			if (result.type === 'success' && (result.data as { saved?: boolean } | undefined)?.saved)
				toast('Opgeslagen');
			if (result.type === 'failure' || result.type === 'success')
				window.scrollTo({ top: 0, behavior: 'smooth' });
		};
	};
}
