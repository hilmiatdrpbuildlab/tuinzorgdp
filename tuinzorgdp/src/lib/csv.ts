/** Semicolon-separated (Excel in Belgium), with formula injection neutralised. */
export function csvCell(v: unknown): string {
	let s = v === null || v === undefined ? '' : String(v);
	if (/^[=+\-@\t]/.test(s)) s = `'${s}`;
	return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
