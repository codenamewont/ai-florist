/**
 * flowerDB 카탈로그 이미지 batch 생성 (1회 실행 → static/flowers/{id}.png)
 *
 * 사용:
 *   npm run generate:flowers -- --dry-run
 *   npm run generate:flowers -- --missing-only
 *   npm run generate:flowers -- --ids 7,14,18
 *   npm run generate:flowers -- --force --ids 14
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { flowerDB } from '../src/lib/server/flowerFlow/flowerDB.js';
import {
	buildFlowerCardPrompt,
	getPromptNameForFlower
} from '../src/lib/flowerFlow/flowerCatalogPrompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'static', 'flowers');

/** @param {string} flag */
function hasFlag(flag) {
	return process.argv.includes(flag);
}

/** @param {string} flag */
function readFlagValue(flag) {
	const index = process.argv.indexOf(flag);
	if (index === -1) return null;
	return process.argv[index + 1] ?? null;
}

function loadEnvFile() {
	const envPath = join(ROOT, '.env');
	if (!existsSync(envPath)) return;

	for (const line of readFileSync(envPath, 'utf8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const separator = trimmed.indexOf('=');
		if (separator === -1) continue;

		const key = trimmed.slice(0, separator).trim();
		const value = trimmed.slice(separator + 1).trim();
		// .env 값을 항상 우선 (터미널에 남은 옛 OPENAI_API_KEY 덮어씀)
		if (key) {
			process.env[key] = value;
		}
	}
}

/** @param {string} value */
function parseIdList(value) {
	return value
		.split(',')
		.map((part) => Number(part.trim()))
		.filter((id) => Number.isInteger(id) && id > 0);
}

/** @param {number} ms */
function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} prompt
 * @returns {Promise<Buffer>}
 */
async function generateFlowerPng(prompt) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured (.env)');
	}

	const size = process.env.OPENAI_IMAGE_CATALOG_SIZE || '1024x1536';
	const quality = process.env.OPENAI_IMAGE_CATALOG_QUALITY || 'low';

	const client = new OpenAI({ apiKey });
	const response = await client.images.generate({
		model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
		prompt,
		size,
		quality,
		n: 1
	});

	const image = response.data?.[0];
	if (image?.b64_json) {
		return Buffer.from(image.b64_json, 'base64');
	}

	if (image?.url) {
		const imageResponse = await fetch(image.url);
		return Buffer.from(await imageResponse.arrayBuffer());
	}

	throw new Error('OpenAI image model did not return image data');
}

async function main() {
	loadEnvFile();

	const dryRun = hasFlag('--dry-run');
	const force = hasFlag('--force');
	const missingOnly = hasFlag('--missing-only');
	const delayMs = Number(readFlagValue('--delay') ?? 2000);
	const idsArg = readFlagValue('--ids');

	/** @type {typeof flowerDB} */
	let targets = [...flowerDB];

	if (idsArg) {
		const ids = new Set(parseIdList(idsArg));
		targets = targets.filter((flower) => ids.has(flower.id));
	}

	if (missingOnly) {
		targets = targets.filter((flower) => !existsSync(join(OUT_DIR, `${flower.id}.png`)));
	}

	if (targets.length === 0) {
		console.log('생성할 꽃이 없습니다.');
		return;
	}

	mkdirSync(OUT_DIR, { recursive: true });

	const size = process.env.OPENAI_IMAGE_CATALOG_SIZE || '1024x1536';
	const quality = process.env.OPENAI_IMAGE_CATALOG_QUALITY || 'low';
	console.log(`대상: ${targets.length}종 · ${size} · quality=${quality}${dryRun ? ' (dry-run)' : ''}`);

	for (const flower of targets) {
		const outPath = join(OUT_DIR, `${flower.id}.png`);
		const promptName = getPromptNameForFlower(flower);
		const prompt = buildFlowerCardPrompt(promptName);

		if (existsSync(outPath) && !force) {
			console.log(`skip id=${flower.id} ${flower.name} (already exists)`);
			continue;
		}

		console.log(`\nid=${flower.id} ${flower.name}`);
		console.log(`promptName: ${promptName}`);
		console.log(`prompt: ${prompt}`);

		if (dryRun) continue;

		try {
			const bytes = await generateFlowerPng(prompt);
			writeFileSync(outPath, bytes);
			console.log(`saved → static/flowers/${flower.id}.png`);
		} catch (err) {
			console.error(`failed id=${flower.id}:`, err instanceof Error ? err.message : err);
		}

		if (delayMs > 0) {
			await wait(delayMs);
		}
	}

	console.log('\n완료.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
