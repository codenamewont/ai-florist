/** @typedef {import('../flowerFlow/jobStore.js').GeneratedImage} GeneratedImage */

import { env } from '$env/dynamic/private';
import { BOUQUET_IMAGE_ASPECT_PROMPT } from '../../flowerFlow/bouquetImageFormat.js';
import { getImageModel, isGeminiConfigured } from './client.js';
import { mockGeneratedImage } from './mock.js';
import { generateOpenAIImage, isOpenAIConfigured } from '../openai/image.js';

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
 * @param {{ edit?: boolean }} [options]
 * @returns {Promise<GeneratedImage>}
 */
export async function generateBouquetImage(basePrompt, options = {}) {
	const suffix = options.edit
		? `Generate exactly one edited bouquet image. Show a single bouquet only, centered in frame. Do not show two bouquets, no side-by-side comparison, no before/after layout, and no duplicate arrangements. ${BOUQUET_IMAGE_ASPECT_PROMPT} Keep it realistic, orderable from a real florist, front-facing, and suitable for a customer preview.`
		: `Generate one final bouquet image. ${BOUQUET_IMAGE_ASPECT_PROMPT} Keep it realistic, orderable from a real florist, front-facing, and suitable for a customer preview.`;
	const prompt = `${basePrompt}\n\n${suffix}`;
	const provider = getImageProvider();

	// Explicit mock mode: develop the full flow without spending any image quota.
	if (provider === 'mock') {
		return mockGeneratedImage();
	}

	if (provider === 'openai') {
		if (!isOpenAIConfigured()) {
			return mockGeneratedImage();
		}

		return generateOpenAIImage(prompt);
	}

	if (!isGeminiConfigured()) {
		return mockGeneratedImage();
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
