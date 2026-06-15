import { env } from '$env/dynamic/private';
import OpenAI, { toFile } from 'openai';
import {
	frameToBouquetOutput,
	padMaskToOpenAIRequestSize,
	padToOpenAIRequestSize,
	OPENAI_REQUEST_SIZE
} from './bouquetImageFrame.js';

let client = null;

export function isOpenAIConfigured() {
	return Boolean(env.OPENAI_API_KEY);
}

function getOpenAIClient() {
	if (!isOpenAIConfigured()) {
		throw new Error('OPENAI_API_KEY is not configured');
	}

	if (!client) {
		client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
	}

	return client;
}

/**
 * @param {import('openai').Images.ImagesResponse['data']} data
 * @returns {Promise<Buffer>}
 */
async function readImageBytes(data) {
	const image = data?.[0];

	if (image?.b64_json) {
		return Buffer.from(image.b64_json, 'base64');
	}

	if (image?.url) {
		const imageResponse = await fetch(image.url);
		return Buffer.from(await imageResponse.arrayBuffer());
	}

	throw new Error('OpenAI image model did not return image data');
}

/**
 * @param {string} prompt
 * @returns {Promise<import('../flowerFlow/jobStore.js').GeneratedImage>}
 */
export async function generateOpenAIImage(prompt) {
	const response = await getOpenAIClient().images.generate({
		model: env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
		prompt,
		size: OPENAI_REQUEST_SIZE,
		n: 1
	});

	const framed = await frameToBouquetOutput(await readImageBytes(response.data));

	return {
		mimeType: 'image/png',
		base64: framed.toString('base64')
	};
}

/**
 * @param {string} prompt
 * @param {{ base64: string, mimeType: string }} sourceImage
 * @param {{ base64: string, mimeType: string } | null} [mask]
 * @returns {Promise<import('../flowerFlow/jobStore.js').GeneratedImage>}
 */
export async function editOpenAIImage(prompt, sourceImage, mask = null) {
	const paddedSource = await padToOpenAIRequestSize(
		Buffer.from(sourceImage.base64, 'base64')
	);
	const imageFile = await toFile(paddedSource, 'bouquet.png', { type: 'image/png' });

	/** @type {import('openai').default.Images.ImageEditParams} */
	const params = {
		model: env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
		image: imageFile,
		prompt,
		size: OPENAI_REQUEST_SIZE,
		n: 1
	};

	if (mask) {
		const paddedMask = await padMaskToOpenAIRequestSize(Buffer.from(mask.base64, 'base64'));
		params.mask = await toFile(paddedMask, 'mask.png', { type: 'image/png' });
	}

	const response = await getOpenAIClient().images.edit(params);
	const framed = await frameToBouquetOutput(await readImageBytes(response.data));

	return {
		mimeType: 'image/png',
		base64: framed.toString('base64')
	};
}
