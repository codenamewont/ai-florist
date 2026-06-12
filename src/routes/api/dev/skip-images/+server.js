import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { loadDevBouquetImages } from '$lib/server/dev/loadFixtureImages.js';
import { requireJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { uploadGeneratedImages } from '$lib/server/flowerFlow/imageStorage.js';
import { mockImagePrompt, mockMoodAnalysis, mockRecipe } from '$lib/server/gemini/mock.js';
import { readJsonBody } from '$lib/server/http.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	if (!dev) {
		return json({ error: 'Dev skip is only available in development.' }, 404);
	}

	try {
		const body = await readJsonBody(request);
		const jobId = typeof body.jobId === 'string' ? body.jobId : '';

		if (!jobId) {
			return json({ error: 'jobId is required' }, 400);
		}

		const job = await requireJob(jobId);
		const moodAnalysis = job.moodAnalysis ?? mockMoodAnalysis();
		const recipe = job.recipe ?? mockRecipe(job.userInput);
		const imagePrompt = job.imagePrompt ?? mockImagePrompt(recipe);
		const images = await uploadGeneratedImages(jobId, loadDevBouquetImages());

		await updateJob(jobId, { moodAnalysis, recipe, imagePrompt, images });

		return json({
			jobId,
			moodAnalysis,
			recipe,
			imagePrompt,
			images,
			mock: true
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Skip images failed';
		const status = message.includes('Job not found') ? 404 : 500;
		return json({ error: message }, status);
	}
}
