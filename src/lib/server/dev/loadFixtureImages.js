import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { mockGeneratedImage } from '$lib/server/gemini/mock.js';

/** @typedef {import('../flowerFlow/jobStore.js').BouquetSize} BouquetSize */
/** @typedef {import('../flowerFlow/jobStore.js').GeneratedImage} GeneratedImage */

const MIME_BY_EXT = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
};

/**
 * static/dev/bouquet-{size}.{jpg|png|svg} 를 읽습니다.
 * 파일이 없으면 mock SVG로 대체합니다.
 * @param {BouquetSize} size
 * @returns {GeneratedImage}
 */
function loadFixtureImage(size) {
	const baseDir = join(process.cwd(), 'static', 'dev');
	const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

	for (const ext of extensions) {
		const filePath = join(baseDir, `bouquet-${size.toLowerCase()}${ext}`);
		if (!existsSync(filePath)) continue;

		const mimeType = MIME_BY_EXT[ext] ?? 'application/octet-stream';
		return {
			mimeType,
			base64: readFileSync(filePath).toString('base64')
		};
	}

	return mockGeneratedImage(size);
}

/** @returns {Partial<Record<BouquetSize, GeneratedImage>>} */
export function loadDevBouquetImages() {
	return {
		S: loadFixtureImage('S'),
		M: loadFixtureImage('M'),
		L: loadFixtureImage('L')
	};
}
