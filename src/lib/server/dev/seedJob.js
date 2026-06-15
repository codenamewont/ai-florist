import { createJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import {
	mockImagePrompt,
	mockMoodAnalysis,
	mockRecipe
} from '$lib/server/gemini/mock.js';
import { uploadGeneratedImages } from '$lib/server/flowerFlow/imageStorage.js';
import { loadDevBouquetImage } from './loadFixtureImages.js';

/**
 * AI 없이 서버 job + sessionStorage용 payload를 한 번에 만듭니다.
 * @param {Record<string, unknown>} userInput
 */
export async function seedDevJob(userInput) {
	const moodAnalysis = mockMoodAnalysis();
	const recipe = mockRecipe(userInput);
	const imagePrompt = mockImagePrompt(recipe);

	const job = await createJob(userInput);
	const images = await uploadGeneratedImages(job.id, loadDevBouquetImage(), `dev-${Date.now()}`);
	await updateJob(job.id, {
		moodAnalysis,
		recipe,
		imagePrompt,
		images
	});

	return {
		jobId: job.id,
		moodAnalysis,
		recipe,
		imagePrompt,
		images,
		mock: true
	};
}
