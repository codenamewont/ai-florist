/**
 * Error thrown for a non-OK API response, carrying the structured fields the
 * server attaches (code/retryable/permanent/retryAfterMs) so callers can decide
 * how to react instead of regex-matching the message.
 */
export class GenerationError extends Error {
	/**
	 * @param {string} message
	 * @param {{ status?: number, code?: string, retryable?: boolean, permanent?: boolean, retryAfterMs?: number }} [info]
	 */
	constructor(message, info = {}) {
		super(message);
		this.name = 'GenerationError';
		this.status = info.status ?? 0;
		this.code = info.code ?? 'unknown';
		this.retryable = Boolean(info.retryable);
		this.permanent = Boolean(info.permanent);
		this.retryAfterMs = typeof info.retryAfterMs === 'number' ? info.retryAfterMs : 0;
	}
}

/**
 * @param {Response} response
 */
async function parseResponse(response) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new GenerationError(
			typeof data.error === 'string' ? data.error : `Request failed (${response.status})`,
			{
				status: response.status,
				code: typeof data.code === 'string' ? data.code : undefined,
				retryable: data.retryable,
				permanent: data.permanent,
				retryAfterMs: data.retryAfterMs
			}
		);
	}
	return data;
}

/**
 * @param {File} image
 * @param {Record<string, unknown>} userInput
 */
export async function analyzeMood(image, userInput) {
	const formData = new FormData();
	formData.append('image', image);

	for (const [key, value] of Object.entries(userInput)) {
		if (value !== undefined && value !== null && value !== '') {
			formData.append(key, String(value));
		}
	}

	const response = await fetch('/api/flower-flow/mood-analysis', {
		method: 'POST',
		body: formData
	});

	return parseResponse(response);
}

/**
 * @param {string} jobId
 * @param {Record<string, unknown>} [userInput]
 */
export async function buildRecipe(jobId, userInput) {
	const response = await fetch('/api/flower-flow/recipe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ jobId, userInput })
	});

	return parseResponse(response);
}

/** @param {string} jobId */
export async function generateImages(jobId) {
	const response = await fetch('/api/flower-flow/generate-images', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ jobId })
	});

	return parseResponse(response);
}

/**
 * @param {string} jobId
 * @param {'S' | 'M' | 'L'} size
 */
export async function selectOption(jobId, size) {
	const response = await fetch('/api/flower-flow/select-option', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ jobId, size })
	});

	return parseResponse(response);
}

/** @param {string} jobId */
export async function fetchJob(jobId) {
	const response = await fetch(`/api/flower-flow/job?jobId=${encodeURIComponent(jobId)}`);
	return parseResponse(response);
}

/**
 * @param {{ mimeType?: string, base64?: string } | null | undefined} image
 */
export function toDataUrl(image) {
	if (!image?.base64) return '';
	return `data:${image.mimeType || 'image/png'};base64,${image.base64}`;
}
