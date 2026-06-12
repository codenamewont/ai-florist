<script>
	import { onMount } from 'svelte';
	import cursorUrl from '$lib/assets/cursor.svg';

	let visible = $state(false);
	let x = $state(0);
	let y = $state(0);

	onMount(() => {
		const canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		if (!canUseCustomCursor) return;

		document.documentElement.classList.add('flower-cursor');

		function handlePointerMove(event) {
			x = event.clientX;
			y = event.clientY;
			visible = true;
		}

		function handlePointerLeave() {
			visible = false;
		}

		window.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('mouseleave', handlePointerLeave);

		return () => {
			document.documentElement.classList.remove('flower-cursor');
			window.removeEventListener('pointermove', handlePointerMove);
			document.removeEventListener('mouseleave', handlePointerLeave);
		};
	});
</script>

{#if visible}
	<div class="flower-cursor-layer" style={`transform: translate3d(${x}px, ${y}px, 0)`}>
		<img class="flower-cursor-icon" src={cursorUrl} alt="" aria-hidden="true" />
	</div>
{/if}

<style>
	:global(html.flower-cursor),
	:global(html.flower-cursor *) {
		cursor: none !important;
	}

	.flower-cursor-layer {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 2147483647;
		pointer-events: none;
		translate: -0.3rem -0.3rem;
	}

	.flower-cursor-icon {
		display: block;
		width: 2.35rem;
		height: 2.35rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.flower-cursor-layer {
			transition: none;
		}
	}
</style>
