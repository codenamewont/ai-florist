/** Artwork DescriptionCard — 단계별 기본 instruction (입력 전) */

/** @typedef {{ title: string, description: string }} ArtworkCardCopy */

/** @type {Record<'create' | 'message' | 'generating' | 'map', ArtworkCardCopy>} */
export const ARTWORK_CARD_DEFAULTS = {
	create: {
		title: 'Who is this bouquet for?',
		description:
			'Choose who will receive it, the occasion, and a style on the right. Adjust the budget if you like.'
	},
	message: {
		title: 'Write a card message',
		description:
			'Type a short note or pick a preset on the right. It will appear on your bouquet card.'
	},
	generating: {
		title: 'Crafting your bouquet',
		description: 'We are turning their mood, photos, and message into a one-of-a-kind arrangement.'
	},
	map: {
		title: 'Choose a florist',
		description:
			'Browse nearby shops on the map and select where you would like to place your order.'
	}
};
