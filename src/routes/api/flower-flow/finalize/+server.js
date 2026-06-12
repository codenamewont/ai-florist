import { requireJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { buildFloristNote } from '$lib/server/gemini/text.js';
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
		const selectedImage = job.images?.primary;

		if (!selectedImage) {
			return json({ error: 'generated image is missing. Run generate-images first.' }, 400);
		}

		const floristNote = job.recipe ? await buildFloristNote(job.recipe) : null;

		await updateJob(jobId, { floristNote });

		return json({
			jobId,
			selectedImage,
			floristNote,
			recipe: job.recipe,
			mock: !isGeminiConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
