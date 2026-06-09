import { env } from '$env/dynamic/private';
import { json, toErrorResponse } from '$lib/server/http.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const lat = Number(url.searchParams.get('lat') ?? '37.5665');
		const lng = Number(url.searchParams.get('lng') ?? '126.978');

		const key = env.KAKAO_REST_API_KEY;

		if (!key) {
			return json({
				mock: true,
				shops: mockShops(lat, lng)
			});
		}

		const query = new URLSearchParams({
			query: '꽃집',
			x: String(lng),
			y: String(lat),
			radius: '2000',
			sort: 'distance'
		});

		const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${query}`, {
			headers: { Authorization: `KakaoAK ${key}` }
		});

		if (!response.ok) {
			return json({ mock: true, shops: mockShops(lat, lng) });
		}

		const data = await response.json();
		const shops = (data.documents ?? []).slice(0, 8).map((doc, index) => ({
			id: doc.id ?? String(index),
			name: doc.place_name,
			address: doc.road_address_name || doc.address_name,
			distance: doc.distance ? `${Math.round(Number(doc.distance))}m` : null,
			lat: Number(doc.y),
			lng: Number(doc.x),
			phone: doc.phone
		}));

		return json({ mock: false, shops });
	} catch (error) {
		return toErrorResponse(error);
	}
}

/**
 * @param {number} lat
 * @param {number} lng
 */
function mockShops(lat, lng) {
	return [
		{
			id: 'mock-1',
			name: 'AI Florist Studio',
			address: 'Sample address 123',
			distance: '320m',
			lat: lat + 0.002,
			lng: lng + 0.001,
			phone: '02-000-0001'
		},
		{
			id: 'mock-2',
			name: 'Bloom & Co.',
			address: 'Sample address 456',
			distance: '580m',
			lat: lat - 0.001,
			lng: lng + 0.002,
			phone: '02-000-0002'
		},
		{
			id: 'mock-3',
			name: 'Morning Petal',
			address: 'Sample address 789',
			distance: '940m',
			lat: lat + 0.001,
			lng: lng - 0.002,
			phone: '02-000-0003'
		}
	];
}
