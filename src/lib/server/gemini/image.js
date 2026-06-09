/** @typedef {import('../flowerFlow/jobStore.js').BouquetSize} BouquetSize */
/** @typedef {import('../flowerFlow/jobStore.js').GeneratedImage} GeneratedImage */

import { env } from '$env/dynamic/private';
import { getImageModel, isGeminiConfigured } from './client.js';
import { mockGeneratedImage } from './mock.js';
import { generateOpenAIImage, isOpenAIConfigured } from '../openai/image.js';

/** S/M/L 공통 — recipe 구성 유지, 볼륨만 변경 */
const SIZE_CONSTRAINTS = `CRITICAL: This is a size variant of the SAME bouquet design.
- Use EXACTLY the same main flowers, sub flowers, greenery, colors, and wrapping from the recipe above.
- Do NOT add, remove, or substitute any flower types or colors.
- Do NOT change wrapping paper style, ribbon, or background.
- Only change the NUMBER OF STEMS and overall bouquet VOLUME/DENSITY.
- Same studio product photo style, front-facing bouquet, white/neutral background.`;

/** @type {Record<BouquetSize, string>} */
const SIZE_PROMPTS = {
	S: `SIZE: SMALL (S) — budget / compact version.
- Slim, compact bouquet; smallest of the three size options.
- Fewer stems: roughly 40% of a standard bouquet (about 3-5 main flower blooms visible).
- Narrow silhouette, delicate and minimal volume.
- Wrapping paper proportionally smaller, hugging a small stem count.`,
	M: `SIZE: MEDIUM (M) — standard version.
- Balanced, everyday florist bouquet; noticeably fuller than S.
- Moderate stems: roughly 70% of a premium bouquet (about 6-9 main flower blooms visible).
- Wider and rounder than S; filler and greenery scaled up proportionally.
- Standard wrapping volume, natural full-but-not-oversized shape.`,
	L: `SIZE: LARGE (L) — premium / generous version.
- Most voluminous and dense; clearly larger than M.
- Abundant stems: full premium bouquet (about 10-15+ main flower blooms visible).
- Wide, lush, grand arrangement; maximum filler and greenery density.
- Largest wrapping spread, framing a generous bouquet.`
};

/** @type {BouquetSize[]} */
const ALL_SIZES = ['S', 'M', 'L'];

export function getImageProvider() {
	const configured = env.IMAGE_PROVIDER?.trim().toLowerCase();
	if (configured === 'mock' || configured === 'openai' || configured === 'gemini') {
		return configured;
	}
	return isOpenAIConfigured() ? 'openai' : 'gemini';
}

export function isImageGenerationConfigured() {
	const provider = getImageProvider();
	if (provider === 'mock') return false;
	return provider === 'openai' ? isOpenAIConfigured() : isGeminiConfigured();
}

/**
 * @param {string} basePrompt
 * @param {BouquetSize} size
 * @returns {Promise<GeneratedImage>}
 */
export async function generateBouquetImage(basePrompt, size) {
	const prompt = `${basePrompt}\n\n${SIZE_CONSTRAINTS}\n\n${SIZE_PROMPTS[size]}`;
	const provider = getImageProvider();

	// Explicit mock mode: develop the full flow without spending any image quota.
	if (provider === 'mock') {
		return mockGeneratedImage(size);
	}

	if (provider === 'openai') {
		if (!isOpenAIConfigured()) {
			return mockGeneratedImage(size);
		}

		return generateOpenAIImage(prompt);
	}

	if (!isGeminiConfigured()) {
		return mockGeneratedImage(size);
	}

	const model = getImageModel();

	const result = await model.generateContent(prompt);
	const parts = result.response.candidates?.[0]?.content?.parts ?? [];

	for (const part of parts) {
		if (part.inlineData?.data) {
			return {
				mimeType: part.inlineData.mimeType || 'image/png',
				base64: part.inlineData.data
			};
		}
	}

	throw new Error('Gemini image model did not return image data');
}

/**
 * @param {string} basePrompt
 * @returns {Promise<Partial<Record<BouquetSize, GeneratedImage>>>}
 */
export async function generateAllSizeImages(basePrompt) {
	/** @type {Partial<Record<BouquetSize, GeneratedImage>>} */
	const images = {};

	for (const size of ALL_SIZES) {
		images[size] = await generateBouquetImage(basePrompt, size);
	}

	return images;
}
