import { createJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { analyzeImageMood } from '$lib/server/gemini/vision.js';
import { isGeminiConfigured } from '$lib/server/gemini/client.js';
import { json, readUserInput, toErrorResponse } from '$lib/server/http.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const image = formData.get('image');

		if (!(image instanceof File)) {
			return json({ error: 'image file is required' }, 400);
		}

		const userInput = readUserInput(formData);
		const job = await createJob(userInput);
		const imageBytes = new Uint8Array(await image.arrayBuffer());
		const moodAnalysis = await analyzeImageMood(imageBytes, image.type || 'image/jpeg', userInput);

		await updateJob(job.id, { moodAnalysis });

		return json({
			jobId: job.id,
			moodAnalysis,
			mock: !isGeminiConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
