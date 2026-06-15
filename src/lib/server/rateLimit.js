/** @type {Map<string, number[]>} */
const buckets = new Map();

/** @typedef {{ limit: number, windowMs: number }} RateLimitConfig */

export const RATE_LIMITS = {
	/** Creates a job and runs vision analysis. */
	moodAnalysis: { limit: 15, windowMs: 60 * 60 * 1000 },
	/** Initial bouquet image generation. */
	imageGeneration: { limit: 20, windowMs: 60 * 60 * 1000 },
	/** Bouquet photo edits (expensive). */
	imageEdit: { limit: 40, windowMs: 60 * 60 * 1000 },
	/** Text recipe + florist note endpoints. */
	textAi: { limit: 60, windowMs: 60 * 60 * 1000 },
	/** Kakao shop search proxy. */
	mapShops: { limit: 120, windowMs: 60 * 60 * 1000 }
};

/**
 * Fixed-window counter stored in memory. Good enough for a single Node instance;
 * on multi-instance/serverless each instance tracks independently.
 *
 * @param {string} key
 * @param {RateLimitConfig} config
 * @returns {{ ok: true } | { ok: false, retryAfterMs: number }}
 */
export function consumeRateLimit(key, config) {
	const now = Date.now();
	const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < config.windowMs);

	if (recent.length >= config.limit) {
		const oldest = recent[0] ?? now;
		return { ok: false, retryAfterMs: Math.max(config.windowMs - (now - oldest), 1000) };
	}

	recent.push(now);
	buckets.set(key, recent);
	return { ok: true };
}
