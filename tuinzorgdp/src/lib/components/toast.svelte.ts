import type { IconName } from '$lib/icons/icons';

export type ToastItem = { id: number; text: string; icon: IconName };

let next = 1;
export const toasts = $state<ToastItem[]>([]);

/** A short confirmation for a completed action. Errors stay on screen in an Alert instead. */
export function toast(text: string, icon: IconName = 'circle-check') {
	const id = next++;
	toasts.push({ id, text, icon });
	setTimeout(() => dismiss(id), 5000);
}

export function dismiss(id: number) {
	const i = toasts.findIndex((t) => t.id === id);
	if (i !== -1) toasts.splice(i, 1);
}
