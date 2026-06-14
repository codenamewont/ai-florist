/** @typedef {import('./jobStore.js').GeneratedImage} GeneratedImage */

/**
 * @param {GeneratedImage} image
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
export async function loadGeneratedImageBytes(image) {
	if (image.base64) {
		return {
			base64: image.base64,
			mimeType: image.mimeType || 'image/png'
		};
	}

	if (image.url) {
		const response = await fetch(image.url);
		if (!response.ok) {
			throw new Error('Failed to load bouquet image for editing');
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		return {
			base64: buffer.toString('base64'),
			mimeType: response.headers.get('content-type') || image.mimeType || 'image/png'
		};
	}

	throw new Error('Bouquet image has no url or base64 data');
}
