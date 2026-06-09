/** @typedef {import('../flowerFlow/jobStore.js').BouquetSize} BouquetSize */
/** @typedef {import('../flowerFlow/jobStore.js').GeneratedImage} GeneratedImage */

import { env } from '$env/dynamic/private';
import { getImageModel, isGeminiConfigured } from './client.js';
import { mockGeneratedImage } from './mock.js';
import { generateOpenAIImage, isOpenAIConfigured } from '../openai/image.js';

/** @type {Record<BouquetSize, string>} */
const SIZE_PROMPTS = {
	S: 'Create a small version with fewer flowers. Simple, delicate, and affordable.',
	M: 'Create a medium version with a balanced amount of flowers and standard florist bouquet volume.',
	L: 'Create a large version with more flowers, fuller volume, premium and abundant.'
};

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
	const prompt = `${basePrompt}\n\n${SIZE_PROMPTS[size]}\nKeep the same flower types, color palette, wrapping style, and mood.`;
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
	const image = await generateBouquetImage(basePrompt, 'M');

	return {
		S: image,
		M: image,
		L: image
	};
}
