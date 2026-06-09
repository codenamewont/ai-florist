import { env } from '$env/dynamic/private';
import OpenAI from 'openai';

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
		size: env.OPENAI_IMAGE_SIZE || '1024x1024',
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
