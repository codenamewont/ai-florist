/** @typedef {import('../flowerFlow/jobStore.js').GeneratedImage} GeneratedImage */

import { env } from '$env/dynamic/private';
import { BOUQUET_IMAGE_ASPECT_PROMPT } from '../../flowerFlow/bouquetImageFormat.js';
import { getImageModel, isGeminiConfigured } from './client.js';
import { mockGeneratedImage } from './mock.js';
import { generateOpenAIImage, editOpenAIImage, isOpenAIConfigured } from '../openai/image.js';

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
 * @param {import('@google/generative-ai').GenerateContentResult} result
 * @returns {GeneratedImage}
 */
function imageFromGeminiResult(result) {
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
 * Initial bouquet generation from a text prompt (generating flow).
 * @param {string} basePrompt
 * @returns {Promise<GeneratedImage>}
 */
export async function generateBouquetImage(basePrompt) {
	const suffix = `Generate one final bouquet image. ${BOUQUET_IMAGE_ASPECT_PROMPT} The STRICT RECIPE flower list above is mandatory: include every listed species and do not add any other flowers. Keep it realistic, orderable from a real florist, front-facing, and suitable for a customer preview.`;
	const prompt = `${basePrompt}\n\n${suffix}`;
	const provider = getImageProvider();

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
	return imageFromGeminiResult(result);
}

/**
 * Edit an existing bouquet photo using the source image as reference.
 * @param {{ base64: string, mimeType: string }} sourceImage
 * @param {string} editPrompt
 * @param {{ mask?: { base64: string, mimeType: string } | null }} [options]
 * @returns {Promise<GeneratedImage>}
 */
export async function editBouquetImage(sourceImage, editPrompt, options = {}) {
	const provider = getImageProvider();
	const mask = options.mask ?? null;

	if (provider === 'mock' || sourceImage.mimeType === 'image/svg+xml') {
		return mockGeneratedImage('Edited bouquet');
	}

	if (provider === 'openai') {
		if (!isOpenAIConfigured()) {
			return mockGeneratedImage('Edited bouquet');
		}

		return editOpenAIImage(editPrompt, sourceImage, mask);
	}

	if (!isGeminiConfigured()) {
		return mockGeneratedImage('Edited bouquet');
	}

	const model = getImageModel();
	/** @type {import('@google/generative-ai').Part[]} */
	const parts = [{ text: editPrompt }, {
		inlineData: {
			data: sourceImage.base64,
			mimeType: sourceImage.mimeType
		}
	}];

	if (mask) {
		parts.push(
			{
				text: 'This mask marks the edit region. Modify the bouquet photo only where the mask is white. Keep black areas unchanged.'
			},
			{
				inlineData: {
					data: mask.base64,
					mimeType: mask.mimeType
				}
			}
		);
	}

	const result = await model.generateContent(parts);

	return imageFromGeminiResult(result);
}
