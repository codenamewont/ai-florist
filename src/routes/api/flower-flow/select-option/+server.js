import { requireJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { buildFloristNote } from '$lib/server/gemini/text.js';
import { isGeminiConfigured } from '$lib/server/gemini/client.js';
import { json, readJsonBody, toErrorResponse } from '$lib/server/http.js';

/** @type {import('$lib/server/flowerFlow/jobStore.js').BouquetSize[]} */
const VALID_SIZES = ['S', 'M', 'L'];

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await readJsonBody(request);
		const jobId = typeof body.jobId === 'string' ? body.jobId : '';
		const size = typeof body.size === 'string' ? body.size : '';

		if (!jobId) {
			return json({ error: 'jobId is required' }, 400);
		}

		if (!VALID_SIZES.includes(size)) {
			return json({ error: 'size must be one of S, M, or L' }, 400);
		}

		const job = requireJob(jobId);
		const selectedImage = job.images?.[/** @type {'S'|'M'|'L'} */ (size)];

		if (!selectedImage) {
			return json({ error: 'selected size image is missing. Run generate-images first.' }, 400);
		}

		const floristNote = job.recipe ? await buildFloristNote(job.recipe) : null;

		updateJob(jobId, {
			selectedSize: /** @type {'S'|'M'|'L'} */ (size),
			floristNote
		});

		return json({
			jobId,
			selectedSize: size,
			selectedImage,
			floristNote,
			recipe: job.recipe,
			mock: !isGeminiConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
