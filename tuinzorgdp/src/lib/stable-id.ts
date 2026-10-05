/**
 * A deterministic UUID-shaped id from a string, so seed scripts can run twice and leave the same rows.
 * Not cryptographic; only used for seed content.
 */
export function stableId(input: string): string {
	let h1 = 0xdeadbeef ^ input.length;
	let h2 = 0x41c6ce57 ^ input.length;
	let h3 = 0x2f6b9a1d;
	let h4 = 0x9e3779b9;
	for (let i = 0; i < input.length; i++) {
		const c = input.charCodeAt(i);
		h1 = Math.imul(h1 ^ c, 2654435761);
		h2 = Math.imul(h2 ^ c, 1597334677);
		h3 = Math.imul(h3 ^ c, 2246822507);
		h4 = Math.imul(h4 ^ c, 3266489909);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
	h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
	h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	const hex = [h1, h2, h3, h4].map((h) => (h >>> 0).toString(16).padStart(8, '0')).join('');
	// Version 4 / variant bits so Postgres and validators accept it as a UUID.
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex[16], 16) & 3) | 8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
