/**
 * Places API (New): the rating and review count only, read by the nightly cron (never by visitors).
 * Google's terms limit storing Places content; only the latest two numbers are kept, with the date.
 */
export async function fetchRating(
	placeId: string,
	key: string,
	fetcher: typeof fetch = fetch
): Promise<{ rating: number; ratingCount: number } | null> {
	const res = await fetcher(
		`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
		{
			headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount' }
		}
	);
	if (!res.ok) throw new Error(`Places API ${res.status}: ${await res.text()}`);
	const data = (await res.json()) as { rating?: number; userRatingCount?: number };
	if (typeof data.rating !== 'number') return null;
	return { rating: Math.round(data.rating * 10) / 10, ratingCount: data.userRatingCount ?? 0 };
}
