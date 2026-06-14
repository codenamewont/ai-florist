import { env } from '$env/dynamic/private';
import OpenAI, { toFile } from 'openai';

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
 * @param {string} prompt
 * @returns {Promise<import('../flowerFlow/jobStore.js').GeneratedImage>}
 */
export async function generateOpenAIImage(prompt) {
	const response = await getOpenAIClient().images.generate({
		model: env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
		prompt,
		size: env.OPENAI_IMAGE_SIZE || '1024x1536',
		n: 1
	});

	const image = response.data?.[0];

	if (image?.b64_json) {
		return {
			mimeType: 'image/png',
			base64: image.b64_json
		};
	}

	if (image?.url) {
		const imageResponse = await fetch(image.url);
		const bytes = new Uint8Array(await imageResponse.arrayBuffer());

		return {
			mimeType: imageResponse.headers.get('content-type') || 'image/png',
			base64: Buffer.from(bytes).toString('base64')
		};
	}

	throw new Error('OpenAI image model did not return image data');
}

/**
 * @param {string} prompt
 * @param {{ base64: string, mimeType: string }} sourceImage
 * @param {{ base64: string, mimeType: string } | null} [mask]
 * @returns {Promise<import('../flowerFlow/jobStore.js').GeneratedImage>}
 */
export async function editOpenAIImage(prompt, sourceImage, mask = null) {
	const buffer = Buffer.from(sourceImage.base64, 'base64');
	const imageFile = await toFile(buffer, 'bouquet.png', { type: sourceImage.mimeType });

	/** @type {import('openai').default.Images.ImageEditParams} */
	const params = {
		model: env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
		image: imageFile,
		prompt,
		size: env.OPENAI_IMAGE_SIZE || '1024x1536',
		n: 1
	};

	if (mask) {
		const maskFile = await toFile(Buffer.from(mask.base64, 'base64'), 'mask.png', {
			type: 'image/png'
		});
		params.mask = maskFile;
	}

	const response = await getOpenAIClient().images.edit(params);

	const image = response.data?.[0];

	if (image?.b64_json) {
		return {
			mimeType: 'image/png',
			base64: image.b64_json
		};
	}

	if (image?.url) {
		const imageResponse = await fetch(image.url);
		const bytes = new Uint8Array(await imageResponse.arrayBuffer());

		return {
			mimeType: imageResponse.headers.get('content-type') || 'image/png',
			base64: Buffer.from(bytes).toString('base64')
		};
	}

	throw new Error('OpenAI image edit did not return image data');
}
