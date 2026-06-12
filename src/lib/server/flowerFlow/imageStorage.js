import {
	getSupabaseClient,
	getSupabaseStorageBucket,
	throwSupabaseError
} from '$lib/server/supabase.js';

/** @typedef {import('./jobStore.js').GeneratedImage} GeneratedImage */

const EXTENSION_BY_MIME = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/svg+xml': 'svg'
};

/** @param {string} mimeType */
function extensionForMime(mimeType) {
	return EXTENSION_BY_MIME[mimeType] ?? 'bin';
}

/**
 * @param {string} jobId
 * @param {GeneratedImage} image
 * @param {string} [revision='primary']
 * @returns {Promise<GeneratedImage>}
 */
export async function uploadGeneratedImage(jobId, image, revision = 'primary') {
	if (!image.base64) {
		return image;
	}

	const supabase = getSupabaseClient();
	const bucket = getSupabaseStorageBucket();
	const mimeType = image.mimeType || 'image/png';
	const path = `${jobId}/${revision}.${extensionForMime(mimeType)}`;
	const bytes = Buffer.from(image.base64, 'base64');

	const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
		contentType: mimeType,
		upsert: true
	});

	if (error) {
		throwSupabaseError(error, 'upload bouquet image');
	}

	const { data } = supabase.storage.from(bucket).getPublicUrl(path);

	return {
		mimeType,
		url: data.publicUrl,
		path
	};
}

/**
 * @param {string} jobId
 * @param {GeneratedImage} image
 * @param {string} [revision]
 * @returns {Promise<{ primary: GeneratedImage }>}
 */
export async function uploadGeneratedImages(jobId, image, revision) {
	return {
		primary: await uploadGeneratedImage(jobId, image, revision)
	};
}
