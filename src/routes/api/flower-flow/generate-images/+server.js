import { requireJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { buildImagePrompt } from '$lib/server/gemini/text.js';
import {
	generateAllSizeImages,
	getImageProvider,
	isImageGenerationConfigured
} from '$lib/server/gemini/image.js';
import { json, readJsonBody, toErrorResponse } from '$lib/server/http.js';

/**
 * @param {import('$lib/server/flowerFlow/jobStore.js').GeneratedImage | undefined} image
 */
function isMockImage(image) {
	return image?.mimeType === 'image/svg+xml';
}

/**
 * Dedupe concurrent generation for the same job. Without this, a remount or
 * double-navigation can fire several generate-images requests at once, which is
 * a common way to *cause* the very rate limits this page then keeps retrying.
 * @type {Map<string, Promise<{ imagePrompt: string, images: Partial<Record<import('$lib/server/flowerFlow/jobStore.js').BouquetSize, import('$lib/server/flowerFlow/jobStore.js').GeneratedImage>> }>>}
 */
const inFlight = new Map();

/** @param {string} jobId @param {import('$lib/server/flowerFlow/jobStore.js').BouquetRecipe} recipe */
function generateForJob(jobId, recipe) {
	const existing = inFlight.get(jobId);
	if (existing) return existing;

	const task = (async () => {
		const imagePrompt = await buildImagePrompt(recipe);
		const images = await generateAllSizeImages(imagePrompt);
		updateJob(jobId, { imagePrompt, images });
		return { imagePrompt, images };
	})().finally(() => {
		inFlight.delete(jobId);
	});

	inFlight.set(jobId, task);
	return task;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await readJsonBody(request);
		const jobId = typeof body.jobId === 'string' ? body.jobId : '';

		if (!jobId) {
			return json({ error: 'jobId is required', code: 'bad_request' }, 400);
		}

		const job = requireJob(jobId);

		if (!job.recipe) {
			return json({ error: 'recipe is missing. Run recipe first.', code: 'bad_request' }, 400);
		}

		if (job.images?.M && !isMockImage(job.images.M)) {
			console.log(
				`[flower-flow] generate-images job=${jobId.slice(0, 8)} cached (already generated)`
			);
			return json({
				jobId,
				imagePrompt: job.imagePrompt,
				images: job.images,
				mock: !isImageGenerationConfigured()
			});
		}

		console.log(
			`[flower-flow] generate-images job=${jobId.slice(0, 8)} provider=${getImageProvider()} → generating...`
		);
		const { imagePrompt, images } = await generateForJob(jobId, job.recipe);
		console.log(
			`[flower-flow] generate-images job=${jobId.slice(0, 8)} OK (mock=${!isImageGenerationConfigured()})`
		);

		return json({
			jobId,
			imagePrompt,
			images,
			mock: !isImageGenerationConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
