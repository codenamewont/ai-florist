import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { mockGeneratedImage } from '$lib/server/gemini/mock.js';

/** @typedef {import('../flowerFlow/jobStore.js').GeneratedImage} GeneratedImage */

const MIME_BY_EXT = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
};

/**
 * static/dev/bouquet.{jpg|png|svg} 또는 기존 bouquet-m 파일을 읽습니다.
 * 파일이 없으면 mock SVG로 대체합니다.
 * @returns {GeneratedImage}
 */
export function loadDevBouquetImage() {
	const baseDir = join(process.cwd(), 'static', 'dev');
	const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
	const names = ['bouquet', 'bouquet-m'];

	for (const name of names) {
		for (const ext of extensions) {
			const filePath = join(baseDir, `${name}${ext}`);
			if (!existsSync(filePath)) continue;

			const mimeType = MIME_BY_EXT[ext] ?? 'application/octet-stream';
			return {
				mimeType,
				base64: readFileSync(filePath).toString('base64')
			};
		}
	}

	return mockGeneratedImage();
}
