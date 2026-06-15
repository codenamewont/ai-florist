/** @typedef {import('../flowerFlow/jobStore.js').BouquetRecipe} BouquetRecipe */
/** @typedef {import('../flowerFlow/jobStore.js').MoodAnalysis} MoodAnalysis */
/** @typedef {import('../flowerFlow/jobStore.js').UserInput} UserInput */

import { flowerDB, matchFlowersFromMood } from '../flowerFlow/flowerDB.js';
import { formatStrictBouquetImagePrompt } from '../../flowerFlow/bouquetImageFormat.js';
import { normalizeRecipeLists } from '../../flowerFlow/resolveRecipeFlowers.js';
import { getTextModel, isGeminiConfigured, parseJsonFromText } from './client.js';
import { mockApplyRecipeEdit, mockRecipe } from './mock.js';

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
		return normalizeRecipeLists(mockRecipe(userInput));
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
- If userInput.notes contains a card message, choose mainFlowers whose wordOfFlower (on each candidate) best matches what the card message says. Flower language fit for the message is the top priority for mainFlowers when a card message exists.
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
	return normalizeRecipeLists(
		/** @type {BouquetRecipe} */ (parseJsonFromText(result.response.text()))
	);
}

/**
 * @param {BouquetRecipe} recipe
 * @returns {Promise<string>}
 */
export async function buildImagePrompt(recipe) {
	return formatStrictBouquetImagePrompt(recipe);
}

/** Flower names allowed in edited recipes — same source as initial recipe generation. */
function getFlowerDBCandidatesByRole() {
	/** @type {{ main: string[], filler: string[], line: string[], foliage: string[] }} */
	const groups = { main: [], filler: [], line: [], foliage: [] };

	for (const flower of flowerDB) {
		if (flower.role === 'main') groups.main.push(flower.name);
		else if (flower.role === 'filler') groups.filler.push(flower.name);
		else if (flower.role === 'line') groups.line.push(flower.name);
		else if (flower.role === 'foliage') groups.foliage.push(flower.name);
	}

	return groups;
}

/**
 * Update a bouquet recipe to reflect a customer edit request.
 * @param {BouquetRecipe} recipe
 * @param {string} editPrompt
 * @returns {Promise<BouquetRecipe>}
 */
export async function applyRecipeEdit(recipe, editPrompt) {
	if (!isGeminiConfigured()) {
		return normalizeRecipeLists(mockApplyRecipeEdit(recipe, editPrompt));
	}

	const candidates = getFlowerDBCandidatesByRole();
	const model = getTextModel();
	const prompt = `You are a professional florist assistant.
Update this bouquet recipe so it matches the customer's edit request.

Allowed flowers from the catalog (use ONLY exact names from these lists):
${JSON.stringify(candidates, null, 2)}

Current recipe:
${JSON.stringify(recipe, null, 2)}

Edit request:
${editPrompt}

Return JSON only with the same schema:
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
- Change only what the edit request implies; keep unrelated fields the same.
- Use ONLY exact candidate names from the catalog lists above. Do not invent, rename, or substitute flowers.
- If the edit only changes ribbon color, wrapping look, or other local styling without adding/removing/swapping flower species, keep mainFlowers, subFlowers, and greenery identical.
- For localized masked edits (prompt mentions "selected region" or "masked edit"): update flower lists only when the request adds, removes, or swaps a species in that region (e.g. "change this part to roses"); otherwise keep mainFlowers, subFlowers, and greenery identical.
- mainFlowers must come from candidates.main only (1-2 items).
- subFlowers must combine candidates.filler and/or candidates.line only (1-4 items total).
- greenery must come from candidates.foliage only (1-2 items).
- If the edit changes flower types (swap, add, remove, or replace), update mainFlowers, subFlowers, and/or greenery so the recipe matches exactly.
- Flower swaps (e.g. "change tulip to rose") must update the matching list entry using exact catalog names.
- The updated recipe is the sole source of truth for the next bouquet image — every listed flower must appear in the photo without omission.`;

	const result = await model.generateContent(prompt);
	return normalizeRecipeLists(
		/** @type {BouquetRecipe} */ (parseJsonFromText(result.response.text()))
	);
}
