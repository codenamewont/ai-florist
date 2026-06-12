/** @typedef {import('../flowerFlow/jobStore.js').BouquetRecipe} BouquetRecipe */
/** @typedef {import('../flowerFlow/jobStore.js').MoodAnalysis} MoodAnalysis */
/** @typedef {import('../flowerFlow/jobStore.js').UserInput} UserInput */

import { matchFlowersFromMood } from '../flowerFlow/flowerDB.js';
import { getTextModel, isGeminiConfigured, parseJsonFromText } from './client.js';
import { mockRecipe } from './mock.js';

/**
 * @param {MoodAnalysis} mood
 * @param {UserInput} userInput
 * @returns {Promise<BouquetRecipe>}
 */
export async function buildBouquetRecipe(mood, userInput = {}) {
	const mapped = matchFlowersFromMood(mood, userInput.season);
	const budget = userInput.budget
		? `around ₩${userInput.budget.toLocaleString('en-US')}`
		: 'around ₩50,000';

	if (!isGeminiConfigured()) {
		return mockRecipe(userInput);
	}

	const model = getTextModel();
	const prompt = `You are a professional florist assistant.
Create a realistic Korean florist bouquet recipe using ONLY the pre-scored candidate flowers below.

Candidate flowers (grouped by floral role; higher matchScore = stronger mood fit):
${JSON.stringify(mapped, null, 2)}

Role guide:
- main: focal blooms — choose 1-2 for mainFlowers
- filler: volume and softness — choose 1-2 for subFlowers
- line: height, rhythm, branches — choose 0-1 for subFlowers
- foliage: greenery and texture — choose 1-2 for greenery

Mood analysis:
${JSON.stringify(mood, null, 2)}

User context:
${JSON.stringify(userInput, null, 2)}

Return JSON only:
{
  "concept": string,
  "mainFlowers": string[],
  "subFlowers": string[],
  "greenery": string[],
  "colors": string[],
  "wrapping": string,
  "shape": string,
  "budget": string
}

Rules:
- Use ONLY exact candidate names from the lists above. Do not invent, rename, or substitute flowers.
- mainFlowers must come from candidates.main only (1-2 items).
- subFlowers must combine candidates.filler and/or candidates.line only (2-4 items total).
- greenery must come from candidates.foliage only (1-2 items).
- Prefer cutAvailability "common" for mainFlowers. Use "limited" as accent at most. Avoid "rare" unless no common main fits the mood.
- Respect priceLevel against budget: favor low/medium for tighter budgets; high-price blooms sparingly.
- Do not place two flowers with the same family field in one recipe.
- Draw palette from candidate colors and mood analysis; suggested colors: ${mapped.colors.join(', ')}.
- Keep the bouquet orderable from a real florist in Korea.
- Budget should be ${budget}.`;

	const result = await model.generateContent(prompt);
	return /** @type {BouquetRecipe} */ (parseJsonFromText(result.response.text()));
}

/**
 * @param {BouquetRecipe} recipe
 * @returns {Promise<string>}
 */
export async function buildImagePrompt(recipe) {
	if (!isGeminiConfigured()) {
		const { mockImagePrompt } = await import('./mock.js');
		return mockImagePrompt(recipe);
	}

	const model = getTextModel();
	const prompt = `Write one detailed image generation prompt for a realistic florist bouquet.
Use this recipe:
${JSON.stringify(recipe, null, 2)}

Rules:
- Real flowers only — use the exact flower names from the recipe
- mainFlowers are the focal blooms; subFlowers add volume and line; greenery frames the bouquet
- No fantasy colors or surreal shapes
- White background, soft natural lighting
- Korean florist style
- Describe bouquet composition only (flower types, colors, wrapping, mood)
- Do NOT specify alternate size variants — generate one final customer preview image
- Return plain text only, no markdown`;

	const result = await model.generateContent(prompt);
	return result.response.text().trim();
}

/**
 * @param {BouquetRecipe} recipe
 * @returns {Promise<string>}
 */
export async function buildFloristNote(recipe) {
	if (!isGeminiConfigured()) {
		const { mockFloristNote } = await import('./mock.js');
		return mockFloristNote(recipe);
	}

	const model = getTextModel();
	const prompt = `Write a concise florist note for a customer-facing result screen.
Use this bouquet recipe:
${JSON.stringify(recipe, null, 2)}

Tone: warm, professional, specific.
Mention why the main, accent, and greenery choices work together as one cohesive bouquet.
Return plain text only.`;

	const result = await model.generateContent(prompt);
	return result.response.text().trim();
}
