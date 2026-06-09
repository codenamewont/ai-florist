import { randomUUID } from 'node:crypto';

/** @typedef {'S' | 'M' | 'L'} BouquetSize */

/**
 * @typedef {Object} UserInput
 * @property {string} [relationship]
 * @property {string} [occasion]
 * @property {string} [style]
 * @property {number} [budget]
 * @property {string} [season]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} MoodAnalysis
 * @property {string[]} colorPalette
 * @property {string[]} moodKeywords
 * @property {string[]} styleImpression
 * @property {string[]} textureKeywords
 * @property {string} energyLevel
 */

/**
 * @typedef {Object} BouquetRecipe
 * @property {string} concept
 * @property {string[]} mainFlowers
 * @property {string[]} subFlowers
 * @property {string[]} greenery
 * @property {string[]} colors
 * @property {string} wrapping
 * @property {string} shape
 * @property {string} budget
 */

/**
 * @typedef {Object} GeneratedImage
 * @property {string} mimeType
 * @property {string} base64
 */

/**
 * @typedef {Object} FlowerJob
 * @property {string} id
 * @property {number} createdAt
 * @property {UserInput} userInput
 * @property {MoodAnalysis | null} moodAnalysis
 * @property {BouquetRecipe | null} recipe
 * @property {string | null} imagePrompt
 * @property {Partial<Record<BouquetSize, GeneratedImage>>} images
 * @property {BouquetSize | null} selectedSize
 * @property {string | null} floristNote
 */

/** @type {Map<string, FlowerJob>} */
const jobs = new Map();

/** @param {Partial<UserInput>} [userInput] */
export function createJob(userInput = {}) {
	const id = randomUUID();

	const job = {
		id,
		createdAt: Date.now(),
		userInput,
		moodAnalysis: null,
		recipe: null,
		imagePrompt: null,
		images: {},
		selectedSize: null,
		floristNote: null
	};

	jobs.set(id, job);
	return job;
}

/** @param {string} jobId */
export function getJob(jobId) {
	return jobs.get(jobId) ?? null;
}

/**
 * @param {string} jobId
 * @param {Partial<FlowerJob>} patch
 */
export function updateJob(jobId, patch) {
	const job = jobs.get(jobId);
	if (!job) return null;

	const updated = { ...job, ...patch };
	jobs.set(jobId, updated);
	return updated;
}

/** @param {string} jobId */
export function requireJob(jobId) {
	const job = getJob(jobId);
	if (!job) {
		throw new JobNotFoundError(jobId);
	}
	return job;
}

export class JobNotFoundError extends Error {
	/** @param {string} jobId */
	constructor(jobId) {
		super(`Job not found: ${jobId}`);
		this.name = 'JobNotFoundError';
	}
}
