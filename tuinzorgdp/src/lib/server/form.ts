/** Reading CMS form fields: trimmed strings, empty → null, checkboxes, numbers, ids. */
export function fields(form: FormData) {
	const raw = (k: string) => {
		const v = form.get(k);
		return typeof v === 'string' ? v : '';
	};
	return {
		str: (k: string) => raw(k).trim(),
		opt: (k: string) => raw(k).trim() || null,
		bool: (k: string) => form.get(k) === 'on' || form.get(k) === 'true',
		int: (k: string, fallback = 0) => {
			const n = Number.parseInt(raw(k), 10);
			return Number.isFinite(n) ? n : fallback;
		},
		num: (k: string) => {
			const t = raw(k).trim().replace(',', '.');
			if (!t) return undefined;
			const n = Number(t);
			return Number.isFinite(n) ? n : undefined;
		},
		id: (k: string) => {
			const v = raw(k).trim();
			return /^[0-9a-f-]{36}$/i.test(v) ? v : null;
		},
		list: (k: string) =>
			form
				.getAll(k)
				.filter((v): v is string => typeof v === 'string')
				.map((v) => v.trim())
				.filter(Boolean),
		json: <T>(k: string, fallback: T): T => {
			try {
				return JSON.parse(raw(k)) as T;
			} catch {
				return fallback;
			}
		},
		date: (k: string) => {
			const v = raw(k).trim();
			return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
		}
	};
}

export const isUuid = (v: string | undefined | null): v is string =>
	!!v && /^[0-9a-f-]{36}$/i.test(v);
