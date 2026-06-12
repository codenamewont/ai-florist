import { randomUUID } from 'node:crypto';
import { getSupabaseClient, throwSupabaseError } from '$lib/server/supabase.js';

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
 * @property {string} [base64]
 * @property {string} [url]
 * @property {string} [path]
 */

/**
 * @typedef {Object} FlowerJob
 * @property {string} id
 * @property {number} createdAt
 * @property {UserInput} userInput
 * @property {MoodAnalysis | null} moodAnalysis
 * @property {BouquetRecipe | null} recipe
 * @property {string | null} imagePrompt
 * @property {{ primary?: GeneratedImage }} images
 * @property {string | null} floristNote
 */

/**
 * @param {any} row
 * @returns {FlowerJob}
 */
function fromRow(row) {
	return {
		id: row.id,
		createdAt: new Date(row.created_at).getTime(),
		userInput: row.user_input ?? {},
		moodAnalysis: row.mood_analysis ?? null,
		recipe: row.recipe ?? null,
		imagePrompt: row.image_prompt ?? null,
		images: row.images ?? {},
		floristNote: row.florist_note ?? null
	};
}

/**
 * @param {Partial<FlowerJob>} patch
 */
function toRowPatch(patch) {
	/** @type {Record<string, unknown>} */
	const row = {};

	if ('userInput' in patch) row.user_input = patch.userInput ?? {};
	if ('moodAnalysis' in patch) row.mood_analysis = patch.moodAnalysis;
	if ('recipe' in patch) row.recipe = patch.recipe;
	if ('imagePrompt' in patch) row.image_prompt = patch.imagePrompt;
	if ('images' in patch) row.images = patch.images ?? {};
	if ('floristNote' in patch) row.florist_note = patch.floristNote;

	return row;
}

/** @param {Partial<UserInput>} [userInput] */
export async function createJob(userInput = {}) {
	const id = randomUUID();
	const createdAt = Date.now();

	/** @type {FlowerJob} */
	const job = {
		id,
		createdAt,
		userInput,
		moodAnalysis: null,
		recipe: null,
		imagePrompt: null,
		images: {},
		floristNote: null
	};

	const { error } = await getSupabaseClient()
		.from('flower_jobs')
		.insert({
			id,
			created_at: new Date(createdAt).toISOString(),
			user_input: userInput,
			images: {}
		});

	if (error) {
		throwSupabaseError(error, 'insert flower job');
	}

	return job;
}

/** @param {string} jobId */
export async function getJob(jobId) {
	const { data, error } = await getSupabaseClient()
		.from('flower_jobs')
		.select('*')
		.eq('id', jobId)
		.maybeSingle();

	if (error) {
		throwSupabaseError(error, 'select flower job');
	}

	return data ? fromRow(data) : null;
}

/**
 * @param {string} jobId
 * @param {Partial<FlowerJob>} patch
 */
export async function updateJob(jobId, patch) {
	const rowPatch = toRowPatch(patch);

	const { data, error } = await getSupabaseClient()
		.from('flower_jobs')
		.update(rowPatch)
		.eq('id', jobId)
		.select('*')
		.maybeSingle();

	if (error) {
		throwSupabaseError(error, 'update flower job');
	}

	return data ? fromRow(data) : null;
}

/** @param {string} jobId */
export async function requireJob(jobId) {
	const job = await getJob(jobId);
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
