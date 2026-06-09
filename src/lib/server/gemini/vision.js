/** @typedef {import('../flowerFlow/jobStore.js').MoodAnalysis} MoodAnalysis */
/** @typedef {import('../flowerFlow/jobStore.js').UserInput} UserInput */

import { getVisionModel, isGeminiConfigured, parseJsonFromText } from './client.js';
import { mockMoodAnalysis } from './mock.js';

/**
 * @param {Uint8Array} imageBytes
 * @param {string} mimeType
 * @param {UserInput} userInput
 * @returns {Promise<MoodAnalysis>}
 */
export async function analyzeImageMood(imageBytes, mimeType, userInput = {}) {
	if (!isGeminiConfigured()) {
		return mockMoodAnalysis();
	}

	const model = getVisionModel();
	const prompt = `Analyze this image for bouquet design inspiration.
Return JSON only with this shape:
{
  "colorPalette": string[],
  "moodKeywords": string[],
  "styleImpression": string[],
  "textureKeywords": string[],
  "energyLevel": "low" | "medium" | "high"
}

User context:
- relationship: ${userInput.relationship ?? 'unknown'}
- occasion: ${userInput.occasion ?? 'unknown'}
- budget: ${userInput.budget ?? 'unknown'}
- season: ${userInput.season ?? 'unknown'}
- notes: ${userInput.notes ?? 'none'}`;

	const result = await model.generateContent([
		{ text: prompt },
		{
			inlineData: {
				data: Buffer.from(imageBytes).toString('base64'),
				mimeType
			}
		}
	]);

	const text = result.response.text();
	return /** @type {MoodAnalysis} */ (parseJsonFromText(text));
}
