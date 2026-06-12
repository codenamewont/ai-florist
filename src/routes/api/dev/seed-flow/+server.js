import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { DEV_CARD_MESSAGE, DEV_USER_INPUT, DEV_USER_INPUT_WITH_NOTES } from '$lib/dev/fixtures.js';
import { DEV_MOODBOARD_UPLOAD, DEV_SNS_UPLOAD } from '$lib/dev/uploadFixtures.js';
import { seedDevJob } from '$lib/server/dev/seedJob.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	if (!dev) {
		return json({ error: 'Dev seed is only available in development.' }, 404);
	}

	let stage = 'result';
	try {
		const body = await request.json().catch(() => ({}));
		if (body.stage === 'options' || body.stage === 'result') {
			stage = body.stage;
		}
	} catch {
		// 기본값 사용
	}

	const seeded = await seedDevJob(DEV_USER_INPUT_WITH_NOTES, stage);

	return json({
		stage,
		session: {
			devSeeded: true,
			/** create 페이지에서 1회만 적용 후 삭제 */
			devCreateSnapshot: DEV_USER_INPUT,
			userInput: DEV_USER_INPUT,
			/** message 페이지에서 1회만 적용 후 삭제 */
			devMessageSnapshot: { text: DEV_CARD_MESSAGE },
			jobId: seeded.jobId,
			moodAnalysis: seeded.moodAnalysis,
			recipe: seeded.recipe,
			imagePrompt: seeded.imagePrompt,
			imagesJobId: seeded.jobId,
			mock: true,
			devUpload: {
				active: true,
				mode: 'moodboard',
				moodboard: DEV_MOODBOARD_UPLOAD,
				sns: DEV_SNS_UPLOAD
			},
			...(stage === 'result' ? { floristNote: seeded.floristNote } : {})
		},
		// create 폼 초기값 참고용 (relationship/occasion/style/budget만)
		formDefaults: DEV_USER_INPUT
	});
}
