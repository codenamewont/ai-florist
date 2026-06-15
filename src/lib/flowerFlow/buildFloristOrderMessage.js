/** @typedef {import('$lib/server/flowerFlow/jobStore.js').UserInput} UserInput */
/** @typedef {import('$lib/server/flowerFlow/jobStore.js').MoodAnalysis} MoodAnalysis */
/** @typedef {import('$lib/server/flowerFlow/jobStore.js').BouquetRecipe} BouquetRecipe */

/** @typedef {{ text: string, highlight: boolean }} OrderMessageSegment */

/** @typedef {{ plainText: string, segments: OrderMessageSegment[] }} OrderMessageLocale */

/** @typedef {OrderMessageLocale & { ko: OrderMessageLocale }} FloristOrderMessageResult */

const EMPTY_LOCALE = /** @type {OrderMessageLocale} */ ({ plainText: '', segments: [] });

/** @type {Record<string, string>} */
const MOOD_EN_TO_KO_STEM = {
	warm: '따뜻',
	romantic: '로맨틱',
	gentle: '부드러',
	soft: '부드러',
	elegant: '우아',
	vibrant: '생기 있는',
	sentimental: '감성적',
	cozy: '아늑',
	fresh: '싱그러',
	natural: '자연스러',
	cheerful: '밝',
	calm: '차분',
	dreamy: '몽환적',
	bold: '선명',
	delicate: '섬세',
	minimal: '미니멀',
	classic: '클래식',
	playful: '발랄',
	modern: '모던',
	organic: '내추럴',
	pastel: '파스텔톤',
	muted: '차분',
	lively: '활기찬'
};

/** @type {Record<string, string>} */
const MOOD_KO_STEM_TO_EN = {
	따뜻: 'warm',
	로맨틱: 'romantic',
	부드러: 'gentle',
	우아: 'elegant',
	'생기 있는': 'vibrant',
	감성적: 'sentimental',
	아늑: 'cozy',
	싱그러: 'fresh',
	자연스러: 'natural',
	밝: 'cheerful',
	차분: 'calm',
	몽환적: 'dreamy',
	선명: 'bold',
	섬세: 'delicate',
	미니멀: 'minimal',
	클래식: 'classic',
	발랄: 'playful',
	모던: 'modern',
	내추럴: 'natural',
	파스텔톤: 'pastel',
	활기찬: 'lively'
};

const HANGUL_RE = /[\u3131-\u318E\uAC00-\uD7A3]/;

/**
 * @param {string} value
 */
function isHangul(value) {
	return HANGUL_RE.test(value);
}

/**
 * @param {string} relationship
 * @param {string | undefined} style
 */
function relationshipPhraseEn(relationship, style) {
	const who = relationship?.trim() || 'Someone special';
	const styleLower = style?.toLowerCase();

	switch (who) {
		case 'Friend':
			return 'my friend';
		case 'Family':
			return 'my family';
		case 'Partner':
			if (styleLower === 'feminine') return 'my girlfriend';
			if (styleLower === 'masculine') return 'my boyfriend';
			return 'my partner';
		case 'Teacher':
			return 'my teacher';
		case 'Others':
			return 'someone special';
		default:
			return isHangul(who) ? who : `my ${who.toLowerCase()}`;
	}
}

/**
 * @param {string} relationship
 * @param {string | undefined} style
 */
function relationshipPhraseKo(relationship, style) {
	const who = relationship?.trim() || '소중한 사람';
	const styleLower = style?.toLowerCase();

	if (isHangul(who)) return who;

	switch (who) {
		case 'Friend':
			return '친구';
		case 'Family':
			return '가족';
		case 'Partner':
			if (styleLower === 'feminine') return '여자친구';
			if (styleLower === 'masculine') return '남자친구';
			return '연인';
		case 'Teacher':
			return '선생님';
		case 'Others':
			return '소중한 사람';
		default:
			return who;
	}
}

/**
 * @param {number | undefined} won
 */
function formatBudgetKo(won) {
	if (!won || !Number.isFinite(won)) return '유연한 예산';
	if (won >= 10_000 && won % 10_000 === 0) return `${won / 10_000}만원`;
	return `₩${won.toLocaleString('ko-KR')}`;
}

/**
 * @param {number | undefined} won
 */
function formatBudgetEn(won) {
	if (!won || !Number.isFinite(won)) return 'a flexible budget';
	const dollars = Math.max(1, Math.round(won / 1_400));
	return `$${dollars}`;
}

/**
 * @param {string} keyword
 */
function toKoMoodStem(keyword) {
	const trimmed = keyword.trim();
	if (!trimmed) return '';

	if (isHangul(trimmed)) {
		return trimmed.replace(/적인$/, '적').replace(/한$/, '').replace(/운$/, '');
	}

	return MOOD_EN_TO_KO_STEM[trimmed.toLowerCase()] ?? trimmed;
}

/**
 * @param {string} stem
 */
function finalizeKoMoodStem(stem) {
	if (!stem) return '';
	if (stem.endsWith('적')) return `${stem}인`;
	if (stem.endsWith(' 있는')) return `${stem}`;
	return `${stem}한`;
}

/**
 * @param {string} keyword
 */
function toEnMoodKeyword(keyword) {
	const trimmed = keyword.trim();
	if (!trimmed) return '';

	if (isHangul(trimmed)) {
		const stem = trimmed.replace(/적인$/, '적').replace(/한$/, '').replace(/운$/, '');
		return MOOD_KO_STEM_TO_EN[stem] ?? trimmed;
	}

	return trimmed.toLowerCase();
}

/**
 * @param {string[]} keywords
 * @param {'en' | 'ko'} lang
 */
function buildMoodPhrase(keywords, lang) {
	const picked = keywords.map((item) => item.trim()).filter(Boolean).slice(0, 2);

	if (!picked.length) {
		return lang === 'ko' ? '따뜻하고 감성적인' : 'warm and romantic';
	}

	if (lang === 'ko') {
		const stems = picked.map((keyword) => toKoMoodStem(keyword)).filter(Boolean);
		if (!stems.length) return '따뜻하고 감성적인';
		if (stems.length === 1) return finalizeKoMoodStem(stems[0]);
		return `${stems[0]}하고 ${finalizeKoMoodStem(stems[1])}`;
	}

	const translated = picked.map((keyword) => toEnMoodKeyword(keyword)).filter(Boolean);
	if (!translated.length) return 'warm and romantic';
	return translated.length === 1 ? translated[0] : `${translated[0]} and ${translated[1]}`;
}

/**
 * @param {MoodAnalysis | null | undefined} moodAnalysis
 * @param {BouquetRecipe | null | undefined} recipe
 */
function collectMoodKeywords(moodAnalysis, recipe) {
	return [
		...(moodAnalysis?.moodKeywords ?? []),
		...(moodAnalysis?.styleImpression ?? []),
		...(moodAnalysis?.textureKeywords ?? []),
		...(recipe?.colors?.slice(0, 1) ?? [])
	];
}

/**
 * @param {string} plainText
 * @param {string[]} highlights
 * @returns {OrderMessageSegment[]}
 */
function buildSegments(plainText, highlights) {
	const unique = [...new Set(highlights.filter(Boolean))].sort((a, b) => b.length - a.length);
	if (!unique.length) return [{ text: plainText, highlight: false }];

	/** @type {OrderMessageSegment[]} */
	const segments = [];
	let cursor = 0;

	while (cursor < plainText.length) {
		let nextIndex = -1;
		let matched = '';

		for (const term of unique) {
			const index = plainText.indexOf(term, cursor);
			if (index === -1) continue;
			if (nextIndex === -1 || index < nextIndex) {
				nextIndex = index;
				matched = term;
			}
		}

		if (nextIndex === -1 || !matched) {
			segments.push({ text: plainText.slice(cursor), highlight: false });
			break;
		}

		if (nextIndex > cursor) {
			segments.push({ text: plainText.slice(cursor, nextIndex), highlight: false });
		}

		segments.push({ text: matched, highlight: true });
		cursor = nextIndex + matched.length;
	}

	return segments.length ? segments : [{ text: plainText, highlight: false }];
}

/**
 * @param {{
 *   userInput?: Partial<UserInput> | null;
 *   moodAnalysis?: MoodAnalysis | null;
 *   recipe?: BouquetRecipe | null;
 * }} input
 * @returns {FloristOrderMessageResult}
 */
export function buildFloristOrderMessage(input) {
	const { userInput, moodAnalysis, recipe } = input;

	if (!recipe && !userInput?.relationship && !userInput?.occasion) {
		return { ...EMPTY_LOCALE, ko: { ...EMPTY_LOCALE } };
	}

	const relationship = userInput?.relationship ?? 'Someone special';
	const style = userInput?.style;
	const budget = userInput?.budget;

	const moodKeywords = collectMoodKeywords(moodAnalysis, recipe);
	const moodEn = buildMoodPhrase(moodKeywords, 'en');
	const moodKo = buildMoodPhrase(moodKeywords, 'ko');

	const relEn = relationshipPhraseEn(relationship, style);
	const relKo = relationshipPhraseKo(relationship, style);
	const budgetEn = formatBudgetEn(budget);
	const budgetKo = formatBudgetKo(budget);

	const plainText =
		`Hi! I'd like to order a bouquet for ${relEn}. ` +
		`My budget is around ${budgetEn}, and I'm looking for something ${moodEn}. ` +
		`Would it be possible to create a bouquet inspired by the reference images below?`;

	const koPlainText =
		`안녕하세요! ${relKo}에게 선물할 꽃다발 주문하려고 합니다. ` +
		`예산은 ${budgetKo} 정도이고, ${moodKo} 무드로 제작 부탁드립니다. ` +
		`아래 레퍼런스 이미지와 비슷한 느낌으로 가능할까요?`;

	return {
		plainText,
		segments: buildSegments(plainText, [relEn, budgetEn, moodEn]),
		ko: {
			plainText: koPlainText,
			segments: buildSegments(koPlainText, [relKo, budgetKo, moodKo])
		}
	};
}
