<script>
	// `step` is 1-based; the matching dot is highlighted as the current step.
	let { step = 1, total = 7 } = $props();

	const dots = $derived(Array.from({ length: total }, (_, i) => i));
</script>

<header class="flex items-center justify-between border-b border-line px-6 py-5 md:px-10">
	<div class="flex items-center gap-3">
		<svg
			class="size-7 shrink-0 translate-y-px text-ink"
			viewBox="0 0 64 64"
			aria-hidden="true"
		>
			<path
				fill="currentColor"
				d="M32 6 C36 6 38.5 10.5 38 15.5 C42.5 12 48 12.5 50.5 16 C53 19.5 50.5 24.5 46 26.5 C51 27.5 54.5 31.5 53.5 36 C52.5 40.5 47 42 42.5 40 C45.5 44 45 49.5 41 52 C37 54.5 32.5 51.5 31 47 C29.5 51.5 25 54.5 21 52 C17 49.5 16.5 44 19.5 40 C15 42 9.5 40.5 8.5 36 C7.5 31.5 11 27.5 16 26.5 C11.5 24.5 9 19.5 11.5 16 C14 12.5 19.5 12 24 15.5 C23.5 10.5 28 6 32 6 Z"
			/>
		</svg>
		<span class="text-lg leading-none tracking-wide">AI Florist</span>
	</div>

	<div class="flex items-center gap-3 sm:gap-4">
		{#each dots as dot (dot)}
			<svg
				class={[
					'shrink-0',
					dot === step - 1
						? 'flower-icon--current size-4.5 text-subtle'
						: 'size-3.5 text-placeholder'
				]}
				viewBox="0 0 64 64"
				aria-hidden="true"
			>
				<path
					fill="currentColor"
					d="M32 6 C36 6 38.5 10.5 38 15.5 C42.5 12 48 12.5 50.5 16 C53 19.5 50.5 24.5 46 26.5 C51 27.5 54.5 31.5 53.5 36 C52.5 40.5 47 42 42.5 40 C45.5 44 45 49.5 41 52 C37 54.5 32.5 51.5 31 47 C29.5 51.5 25 54.5 21 52 C17 49.5 16.5 44 19.5 40 C15 42 9.5 40.5 8.5 36 C7.5 31.5 11 27.5 16 26.5 C11.5 24.5 9 19.5 11.5 16 C14 12.5 19.5 12 24 15.5 C23.5 10.5 28 6 32 6 Z"
				/>
			</svg>
		{/each}
	</div>
</header>

<style>
	.flower-icon--current {
		animation: flower-spin 2.4s linear infinite;
	}

	@keyframes flower-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flower-icon--current {
			animation: none;
		}
	}
</style>
