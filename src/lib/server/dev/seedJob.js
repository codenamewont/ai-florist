import { createJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import {
	mockFloristNote,
	mockImagePrompt,
	mockMoodAnalysis,
	mockRecipe
} from '$lib/server/gemini/mock.js';
import { loadDevBouquetImages } from './loadFixtureImages.js';

/** @typedef {'options' | 'result'} DevSeedStage */

/**
 * AI 없이 서버 job + sessionStorage용 payload를 한 번에 만듭니다.
 * @param {Record<string, unknown>} userInput
 * @param {DevSeedStage} [stage='result']
 */
export function seedDevJob(userInput, stage = 'result') {
	const moodAnalysis = mockMoodAnalysis();
	const recipe = mockRecipe(userInput);
	const imagePrompt = mockImagePrompt(recipe);
	const images = loadDevBouquetImages();
	const floristNote = stage === 'result' ? mockFloristNote(recipe) : null;

	const job = createJob(userInput);
	updateJob(job.id, {
		moodAnalysis,
		recipe,
		imagePrompt,
		images,
		...(stage === 'result' ? { selectedSize: 'M', floristNote } : {})
	});

	return {
		jobId: job.id,
		moodAnalysis,
		recipe,
		imagePrompt,
		images,
		selectedSize: stage === 'result' ? 'M' : null,
		floristNote,
		mock: true
	};
}
