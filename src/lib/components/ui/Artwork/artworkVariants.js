import create1 from '$lib/assets/artwork/1.create1.svg';
import create2 from '$lib/assets/artwork/2.create2.svg';
import upload1 from '$lib/assets/artwork/3.upload1.svg';
import upload2 from '$lib/assets/artwork/4.upload2.svg';
import message1 from '$lib/assets/artwork/5.message1.svg';
import generated from '$lib/assets/artwork/6.generated.svg';

/** @typedef {'create1' | 'create2' | 'upload1' | 'upload2' | 'message1' | 'generated'} ArtworkVariant */

/** @type {Record<ArtworkVariant, string>} */
export const ARTWORK_SRC = {
	create1,
	create2,
	upload1,
	upload2,
	message1,
	generated
};

/** generating 페이지 순환 프레임 */
export const GENERATING_ARTWORK_CYCLE = /** @type {const} */ ([
	'create2',
	'upload1',
	'upload2',
	'message1',
	'generated'
]);

/** @param {ArtworkVariant} [variant='create1'] */
export function getArtworkSrc(variant = 'create1') {
	return ARTWORK_SRC[variant] ?? ARTWORK_SRC.create1;
}
