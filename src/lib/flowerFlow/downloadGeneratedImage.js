const EXTENSION_BY_MIME = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

/**
 * @param {string} [title]
 */
function buildDownloadFilename(title) {
	const slug = (title ?? '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 48);

	return slug || 'bouquet';
}

/**
 * @param {string} mimeType
 */
function extensionForMime(mimeType) {
	return EXTENSION_BY_MIME[mimeType] ?? 'png';
}

/**
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerDownload(blob, filename) {
	const blobUrl = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = blobUrl;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(blobUrl);
}

/**
 * @param {{ mimeType?: string, base64?: string, url?: string } | null | undefined} image
 * @param {string} [title]
 */
export async function downloadGeneratedImage(image, title) {
	if (!image?.base64 && !image?.url) return;

	const mimeType = image.mimeType || 'image/png';
	const filename = `${buildDownloadFilename(title)}.${extensionForMime(mimeType)}`;

	if (image.base64) {
		const binary = atob(image.base64);
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index += 1) {
			bytes[index] = binary.charCodeAt(index);
		}
		triggerDownload(new Blob([bytes], { type: mimeType }), filename);
		return;
	}

	const response = await fetch(image.url);
	if (!response.ok) {
		throw new Error('Failed to download bouquet image');
	}

	triggerDownload(await response.blob(), filename);
}
