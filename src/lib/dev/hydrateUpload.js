/**
 * static URL → File 변환 (upload UI 미리보기·primaryFile용)
 * @param {string} url
 * @param {string} filename
 * @returns {Promise<File>}
 */
export async function urlToFile(url, filename) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to load dev upload image: ${url}`);
	}
	const blob = await response.blob();
	return new File([blob], filename, { type: blob.type || 'image/svg+xml' });
}

/**
 * @param {Record<string, string>} tiles
 * @returns {Promise<Record<string, File>>}
 */
export async function hydrateDevUpload(tiles) {
	/** @type {Record<string, File>} */
	const files = {};

	await Promise.all(
		Object.entries(tiles).map(async ([key, url]) => {
			const ext = url.split('.').pop() ?? 'svg';
			files[key] = await urlToFile(url, `dev-${key}.${ext}`);
		})
	);

	return files;
}
