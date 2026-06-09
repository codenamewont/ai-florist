export {};

declare global {
	interface Window {
		kakao: {
			maps: {
				load: (callback: () => void) => void;
				LatLng: new (lat: number, lng: number) => unknown;
				LatLngBounds: new () => { extend: (latlng: unknown) => void };
				event: {
					addListener: (target: unknown, type: string, handler: () => void) => void;
				};
				Map: new (
					container: HTMLElement,
					options: { center: unknown; level: number }
				) => {
					setBounds: (bounds: unknown) => void;
					panTo: (latlng: unknown) => void;
					relayout: () => void;
					getCenter: () => { getLat: () => number; getLng: () => number };
				};
				Marker: new (options: { position: unknown; map: unknown }) => {
					setMap: (map: unknown) => void;
					setZIndex: (z: number) => void;
				};
				InfoWindow: new (options?: { removable?: boolean }) => {
					open: (map: unknown, marker: unknown) => void;
					close: () => void;
					setContent: (content: string) => void;
				};
			};
		};
	}
}
