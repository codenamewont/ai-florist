import { requireJob } from '$lib/server/flowerFlow/jobStore.js';
import { isGeminiConfigured } from '$lib/server/gemini/client.js';
import { json, toErrorResponse } from '$lib/server/http.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const jobId = url.searchParams.get('jobId') ?? '';

		if (!jobId) {
			return json({ error: 'jobId is required' }, 400);
		}

		const job = await requireJob(jobId);

		return json({
			jobId: job.id,
			userInput: job.userInput,
			moodAnalysis: job.moodAnalysis,
			recipe: job.recipe,
			imagePrompt: job.imagePrompt,
			images: job.images,
			selectedSize: job.selectedSize,
			floristNote: job.floristNote,
			mock: !isGeminiConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
