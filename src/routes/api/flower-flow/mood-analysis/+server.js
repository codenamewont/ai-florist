import { createJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { analyzeImageMood } from '$lib/server/gemini/vision.js';
import { isGeminiConfigured } from '$lib/server/gemini/client.js';
import { RATE_LIMITS } from '$lib/server/rateLimit.js';
import { MAX_MOOD_IMAGE_BYTES, MAX_MOOD_IMAGE_LABEL } from '$lib/server/uploadLimits.js';
import { enforceRateLimit, json, readUserInput, toErrorResponse } from '$lib/server/http.js';

/**
 * @param {string} jobId
 * @param {Uint8Array} imageBytes
 * @param {string} mimeType
 * @param {Record<string, unknown>} userInput
 */
async function runMoodAnalysis(jobId, imageBytes, mimeType, userInput) {
	try {
		const moodAnalysis = await analyzeImageMood(imageBytes, mimeType, userInput);
		await updateJob(jobId, { moodAnalysis });
	} catch (error) {
		console.error(`Background mood analysis failed for job ${jobId}`, error);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, getClientAddress }) {
	try {
		const limited = enforceRateLimit(getClientAddress(), RATE_LIMITS.moodAnalysis, 'mood-analysis');
		if (limited) return limited;

		const formData = await request.formData();
		const image = formData.get('image');

		if (!(image instanceof File)) {
			return json({ error: 'image file is required', code: 'bad_request' }, 400);
		}

		if (image.size > MAX_MOOD_IMAGE_BYTES) {
			return json(
				{
					error: `Image must be ${MAX_MOOD_IMAGE_LABEL} or smaller.`,
					code: 'bad_request'
				},
				400
			);
		}

		const userInput = readUserInput(formData);
		const job = await createJob(userInput);
		const imageBytes = new Uint8Array(await image.arrayBuffer());
		const mimeType = image.type || 'image/jpeg';

		void runMoodAnalysis(job.id, imageBytes, mimeType, userInput);

		return json({
			jobId: job.id,
			moodAnalysis: null,
			pending: true,
			mock: !isGeminiConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
