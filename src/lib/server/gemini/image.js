/** @typedef {import('../flowerFlow/jobStore.js').GeneratedImage} GeneratedImage */

import { BOUQUET_IMAGE_ASPECT_PROMPT } from '../../flowerFlow/bouquetImageFormat.js';
import { mockGeneratedImage } from './mock.js';
import { generateOpenAIImage, editOpenAIImage, isOpenAIConfigured } from '../openai/image.js';

export function isImageGenerationConfigured() {
	return isOpenAIConfigured();
}

/**
 * Initial bouquet generation from a text prompt (generating flow).
 * @param {string} basePrompt
 * @returns {Promise<GeneratedImage>}
 */
export async function generateBouquetImage(basePrompt) {
	const suffix = `Generate one final bouquet image. ${BOUQUET_IMAGE_ASPECT_PROMPT} The STRICT RECIPE flower list above is mandatory: include every listed species and do not add any other flowers. Keep it realistic, orderable from a real florist, front-facing, and suitable for a customer preview.`;
	const prompt = `${basePrompt}\n\n${suffix}`;

	if (!isOpenAIConfigured()) {
		return mockGeneratedImage();
	}

	return generateOpenAIImage(prompt);
}

/**
 * Edit an existing bouquet photo using the source image as reference.
 * @param {{ base64: string, mimeType: string }} sourceImage
 * @param {string} editPrompt
 * @param {{ mask?: { base64: string, mimeType: string } | null }} [options]
 * @returns {Promise<GeneratedImage>}
 */
export async function editBouquetImage(sourceImage, editPrompt, options = {}) {
	const mask = options.mask ?? null;

	if (sourceImage.mimeType === 'image/svg+xml' || !isOpenAIConfigured()) {
		return mockGeneratedImage('Edited bouquet');
	}

	return editOpenAIImage(editPrompt, sourceImage, mask);
}
