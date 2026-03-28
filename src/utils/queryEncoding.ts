/** Encode a human query for use as a URL path segment: spaces become "+" */
export function encodeQuery(raw: string): string {
	return encodeURIComponent(raw.trim()).replace(/%20/g, "+");
}

/** Decode a URL path segment back to a human query: "+" becomes space */
export function decodeQuery(encoded: string): string {
	return decodeURIComponent(encoded.replace(/\+/g, "%20"));
}
