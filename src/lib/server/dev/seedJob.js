import { createJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import {
	mockFloristNote,
	mockImagePrompt,
	mockMoodAnalysis,
	mockRecipe
} from '$lib/server/gemini/mock.js';
import { uploadGeneratedImages } from '$lib/server/flowerFlow/imageStorage.js';
import { loadDevBouquetImage } from './loadFixtureImages.js';

/** @typedef {'options' | 'result'} DevSeedStage */

/**
 * AI 없이 서버 job + sessionStorage용 payload를 한 번에 만듭니다.
 * @param {Record<string, unknown>} userInput
 * @param {DevSeedStage} [stage='result']
 */
export async function seedDevJob(userInput, stage = 'result') {
	const moodAnalysis = mockMoodAnalysis();
	const recipe = mockRecipe(userInput);
	const imagePrompt = mockImagePrompt(recipe);
	const floristNote = stage === 'result' ? mockFloristNote(recipe) : null;

	const job = await createJob(userInput);
	const images = await uploadGeneratedImages(job.id, loadDevBouquetImage(), `dev-${Date.now()}`);
	await updateJob(job.id, {
		moodAnalysis,
		recipe,
		imagePrompt,
		images,
		...(stage === 'result' ? { floristNote } : {})
	});

	return {
		jobId: job.id,
		moodAnalysis,
		recipe,
		imagePrompt,
		images,
		floristNote,
		mock: true
	};
}
