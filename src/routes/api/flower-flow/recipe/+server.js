import { requireJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { buildBouquetRecipe } from '$lib/server/gemini/text.js';
import { isGeminiConfigured } from '$lib/server/gemini/client.js';
import { json, readJsonBody, toErrorResponse } from '$lib/server/http.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await readJsonBody(request);
		const jobId = typeof body.jobId === 'string' ? body.jobId : '';

		if (!jobId) {
			return json({ error: 'jobId is required' }, 400);
		}

		const job = await requireJob(jobId);

		if (!job.moodAnalysis) {
			return json({ error: 'moodAnalysis is missing. Run mood-analysis first.' }, 400);
		}

		if (body.userInput && typeof body.userInput === 'object') {
			await updateJob(jobId, {
				userInput: { ...job.userInput, .../** @type {Record<string, unknown>} */ (body.userInput) }
			});
		}

		const currentJob = await requireJob(jobId);
		const recipe = await buildBouquetRecipe(currentJob.moodAnalysis, currentJob.userInput);
		await updateJob(jobId, { recipe });

		return json({
			jobId,
			recipe,
			mock: !isGeminiConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
