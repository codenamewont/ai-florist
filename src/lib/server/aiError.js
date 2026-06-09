/**
 * Classify an AI provider error (Gemini / OpenAI) into a structured shape the
 * API layer and client can act on, instead of regex-matching message strings.
 *
 * The goal: never again show "rate-limited, retrying forever" for an error that
 * is actually permanent (billing/quota exhausted, bad auth) or unrelated.
 *
 * @typedef {Object} AiErrorInfo
 * @property {number} status        HTTP status to return to the client
 * @property {string} message       human-readable message
 * @property {string} code          short machine code (e.g. 'rate_limited')
 * @property {boolean} retryable    safe to retry after a delay?
 * @property {boolean} permanent    will never succeed without user action?
 * @property {number} retryAfterMs  suggested wait before retrying
 */

const DEFAULT_RETRY_MS = 15_000;
const MIN_RETRY_MS = 5_000;
const MAX_RETRY_MS = 60_000;

/** @param {number} seconds */
function clampRetryMs(seconds) {
	if (!Number.isFinite(seconds) || seconds <= 0) return DEFAULT_RETRY_MS;
	return Math.max(MIN_RETRY_MS, Math.min(seconds * 1000, MAX_RETRY_MS));
}

/**
 * Pull a "retry after N seconds" hint out of whatever the provider gave us:
 * an OpenAI `retry-after` header, a Gemini RetryInfo detail, or the raw message.
 * @param {any} error
 * @param {string} message
 */
function extractRetryMs(error, message) {
	// OpenAI: retry-after header (object map or Headers instance)
	const headers = error?.headers;
	if (headers) {
		const raw =
			typeof headers.get === 'function' ? headers.get('retry-after') : headers['retry-after'];
		if (raw) return clampRetryMs(Number(raw));
	}

	// Gemini legacy SDK: errorDetails[].retryDelay = "56s"
	const details = error?.errorDetails;
	if (Array.isArray(details)) {
		for (const detail of details) {
			const delay = detail?.retryDelay;
			if (typeof delay === 'string') {
				const seconds = Number(delay.replace(/s$/i, ''));
				if (Number.isFinite(seconds)) return clampRetryMs(seconds);
			}
		}
	}

	// Fallback: scrape the message ("retry in 56s" / "retryDelay": "56s")
	const match =
		message.match(/retry(?:\s+in|delay)["'\s:]*([\d.]+)\s*s/i) ??
		message.match(/"retryDelay"\s*:\s*"?([\d.]+)s/i);
	if (match) return clampRetryMs(Number(match[1]));

	return DEFAULT_RETRY_MS;
}

/**
 * @param {unknown} error
 * @returns {AiErrorInfo}
 */
export function describeAiError(error) {
	const message = error instanceof Error ? error.message : String(error);
	/** @type {any} */
	const anyErr = error;

	// Numeric status from either SDK (OpenAI APIError.status, Gemini fetch error .status)
	let status = typeof anyErr?.status === 'number' ? anyErr.status : 0;
	if (!status) {
		const m = message.match(/\[(\d{3})\b/) ?? message.match(/\b(4\d{2}|5\d{2})\b/);
		if (m) status = Number(m[1]);
	}

	const code = typeof anyErr?.code === 'string' ? anyErr.code : '';
	const lower = `${code} ${message}`.toLowerCase();

	// Permanent billing/quota: waiting will NEVER help — the user must act.
	const billingExhausted =
		code === 'insufficient_quota' ||
		/insufficient_quota|exceeded your current quota|billing|payment|plan and billing/.test(lower);

	if (billingExhausted) {
		return {
			status: 402,
			code: 'quota_exhausted',
			message:
				'Image generation is blocked: the provider account is out of quota/credits. Check billing and usage limits on the provider dashboard.',
			retryable: false,
			permanent: true,
			retryAfterMs: 0
		};
	}

	// Auth / verification problems — also permanent until the user fixes config.
	if (
		status === 401 ||
		status === 403 ||
		/api key|unauthorized|permission|verify your org/.test(lower)
	) {
		return {
			status: status === 403 ? 403 : 401,
			code: 'auth',
			message: `Provider rejected the request (auth/permission): ${message}`,
			retryable: false,
			permanent: true,
			retryAfterMs: 0
		};
	}

	// Transient rate limit.
	if (
		status === 429 ||
		/rate limit|too many requests|resource has been exhausted|quota/.test(lower)
	) {
		return {
			status: 429,
			code: 'rate_limited',
			message: 'AI provider is rate-limiting requests right now.',
			retryable: true,
			permanent: false,
			retryAfterMs: extractRetryMs(anyErr, message)
		};
	}

	// Transient server-side outage / overload.
	if (
		status === 500 ||
		status === 502 ||
		status === 503 ||
		status === 504 ||
		/overloaded|unavailable|high demand|try again later/.test(lower)
	) {
		return {
			status: 503,
			code: 'unavailable',
			message: 'AI provider is temporarily unavailable or overloaded.',
			retryable: true,
			permanent: false,
			retryAfterMs: extractRetryMs(anyErr, message)
		};
	}

	// Bad request (e.g. unsupported model, bad prompt) — retrying won't help.
	if (status === 400 || status === 404 || status === 422) {
		return {
			status,
			code: 'bad_request',
			message: `Provider rejected the request: ${message}`,
			retryable: false,
			permanent: true,
			retryAfterMs: 0
		};
	}

	// Unknown: treat as a non-retryable server error so it surfaces instead of looping.
	return {
		status: 500,
		code: 'unknown',
		message: message || 'Unexpected error during generation.',
		retryable: false,
		permanent: false,
		retryAfterMs: 0
	};
}
