import { JobNotFoundError } from '$lib/server/flowerFlow/jobStore.js';
import { describeAiError } from '$lib/server/aiError.js';

/**
 * @param {unknown} error
 */
export function toErrorResponse(error) {
	if (error instanceof JobNotFoundError) {
		console.warn(
			`[flower-flow] job_not_found (404) — ${error.message} (server restart wipes jobs)`
		);
		return new Response(JSON.stringify({ error: error.message, code: 'job_not_found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (error instanceof Response) {
		return error;
	}

	const info = describeAiError(error);

	// Always log the *real* provider error server-side so it is not hidden behind
	// a generic client message. Include the original message for debugging.
	console.error(
		`[flower-flow] ${info.code} (${info.status})`,
		error instanceof Error ? error.stack || error.message : error
	);

	/** @type {Record<string, string>} */
	const headers = { 'Content-Type': 'application/json' };
	if (info.retryAfterMs > 0) headers['Retry-After'] = String(Math.ceil(info.retryAfterMs / 1000));

	return new Response(
		JSON.stringify({
			error: info.message,
			code: info.code,
			retryable: info.retryable,
			permanent: info.permanent,
			retryAfterMs: info.retryAfterMs
		}),
		{ status: info.status, headers }
	);
}

/**
 * @param {unknown} body
 * @param {number} [status]
 */
export function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

/**
 * @param {FormData} formData
 * @param {string} field
 */
export function readOptionalString(formData, field) {
	const value = formData.get(field);
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * @param {FormData} formData
 * @param {string} field
 */
export function readOptionalNumber(formData, field) {
	const value = readOptionalString(formData, field);
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * @param {FormData} formData
 */
export function readUserInput(formData) {
	return {
		relationship: readOptionalString(formData, 'relationship'),
		occasion: readOptionalString(formData, 'occasion'),
		budget: readOptionalNumber(formData, 'budget'),
		season: readOptionalString(formData, 'season'),
		notes: readOptionalString(formData, 'notes')
	};
}

/**
 * @param {Request} request
 */
export async function readJsonBody(request) {
	return /** @type {Record<string, unknown>} */ (await request.json());
}
