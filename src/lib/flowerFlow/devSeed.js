import { saveFlow } from './session.js';

/**
 * @param {'options' | 'result'} [stage='result']
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function seedDevFlow(stage = 'result') {
	const response = await fetch('/api/dev/seed-flow', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ stage })
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		return {
			ok: false,
			error: typeof data.error === 'string' ? data.error : 'Dev seed failed'
		};
	}

	if (data.session && typeof data.session === 'object') {
		saveFlow(data.session);
	}

	return { ok: true };
}

/**
 * AI 이미지 생성 없이 static/dev 더미 이미지를 job에 넣습니다.
 * @param {string} jobId
 * @returns {Promise<{ ok: true, data: Record<string, unknown> } | { ok: false, error: string }>}
 */
export async function skipDevImages(jobId) {
	const response = await fetch('/api/dev/skip-images', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ jobId })
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		return {
			ok: false,
			error: typeof data.error === 'string' ? data.error : 'Skip images failed'
		};
	}

	saveFlow({
		recipe: data.recipe,
		moodAnalysis: data.moodAnalysis,
		imagesJobId: jobId,
		imagePrompt: data.imagePrompt,
		mock: true
	});

	return { ok: true, data };
}
