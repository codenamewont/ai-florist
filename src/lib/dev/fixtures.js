/** create / message 단계용 더미 userInput */
export const DEV_USER_INPUT = {
	relationship: 'Family',
	occasion: 'Birthday',
	style: 'Classic',
	budget: 50_000
};

export const DEV_CARD_MESSAGE = 'Wishing you the happiest birthday, with love always.';

/** message Continue 후 userInput.notes 형태 */
export const DEV_USER_INPUT_WITH_NOTES = {
	...DEV_USER_INPUT,
	notes: `Card message: ${DEV_CARD_MESSAGE}`
};
