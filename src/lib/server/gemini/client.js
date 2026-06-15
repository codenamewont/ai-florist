import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

let client = null;

export function isGeminiConfigured() {
	return Boolean(env.GEMINI_API_KEY);
}

function getClient() {
	if (!isGeminiConfigured()) {
		throw new Error('GEMINI_API_KEY is not configured');
	}

	if (!client) {
		client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
	}

	return client;
}

export function getTextModel() {
	return getClient().getGenerativeModel({
		model: env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash'
	});
}

export function getVisionModel() {
	return getClient().getGenerativeModel({
		model: env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash'
	});
}

/**
 * @param {string} text
 */
export function parseJsonFromText(text) {
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	const candidate = fenced?.[1]?.trim() ?? text.trim();

	try {
		return JSON.parse(candidate);
	} catch {
		const start = candidate.indexOf('{');
		const end = candidate.lastIndexOf('}');
		if (start >= 0 && end > start) {
			return JSON.parse(candidate.slice(start, end + 1));
		}
		throw new Error('Failed to parse JSON from model response');
	}
}
