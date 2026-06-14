<script>
	import flowerIconUrl from '$lib/assets/flower.svg';

	let {
		name,
		nameKo,
		wordOfFlower,
		wordOfFlowerKo,
		imageSrc,
		role = 'main'
	} = $props();

	let flipped = $state(false);

	const roleLabel = $derived(
		role === 'main' ? 'Main' : role === 'greenery' ? 'Greenery' : 'Filler'
	);
	const roleLabelKo = $derived(
		role === 'main' ? '메인' : role === 'greenery' ? '그리너리' : '필러'
	);

	function toggleFlip() {
		flipped = !flipped;
	}
</script>

<button
	type="button"
	class="flip-card h-[16.25rem] w-40 shrink-0 snap-start cursor-pointer border-none bg-transparent p-0 text-left"
	aria-label={flipped ? `${nameKo} card, show English` : `${name} card, show Korean`}
	onclick={toggleFlip}
>
	<div class="flip-card-inner h-full" class:is-flipped={flipped}>
		<article
			class="flip-card-face flex h-full flex-col overflow-hidden rounded-2xl border border-line-strong bg-white shadow-sm"
		>
			<div class="flex h-6 shrink-0 items-center gap-1.5 px-3 pt-3">
				<img src={flowerIconUrl} alt="" class="size-3.5 shrink-0" aria-hidden="true" />
				<span class="text-xs leading-none text-ink">{roleLabel}</span>
			</div>

			<div class="relative mx-2 mt-2 min-h-0 flex-1">
				<img
					src={imageSrc}
					alt={name}
					class="h-full w-full object-contain object-bottom"
					loading="lazy"
				/>
			</div>

			<div class="shrink-0 px-3 pb-4 pt-2">
				<h3
					class="flex min-h-8 items-center justify-center text-center text-sm leading-tight tracking-wide text-ink"
				>
					<span class="line-clamp-2">{name}</span>
				</h3>

				<p class="line-clamp-2 text-center text-[0.6875rem] leading-snug text-ink">
					{wordOfFlower}
				</p>
			</div>
		</article>

		<article
			class="flip-card-face flip-card-back flex h-full flex-col overflow-hidden rounded-2xl border border-line-strong bg-white shadow-sm"
			aria-hidden={!flipped}
		>
			<div class="flex h-6 shrink-0 items-center gap-1.5 px-3 pt-3">
				<img src={flowerIconUrl} alt="" class="size-3.5 shrink-0" aria-hidden="true" />
				<span class="text-xs leading-none text-ink">{roleLabelKo}</span>
			</div>

			<div class="relative mx-2 mt-2 min-h-0 flex-1">
				<img
					src={imageSrc}
					alt={nameKo}
					class="h-full w-full object-contain object-bottom"
					loading="lazy"
				/>
			</div>

			<div class="shrink-0 px-3 pb-4 pt-2">
				<h3
					class="flex min-h-8 items-center justify-center text-center text-sm leading-tight tracking-wide text-ink"
				>
					<span class="line-clamp-2">{nameKo}</span>
				</h3>

				<p class="line-clamp-2 text-center text-[0.6875rem] leading-snug text-ink">
					{wordOfFlowerKo}
				</p>
			</div>
		</article>
	</div>
</button>

<style>
	.flip-card {
		perspective: 1000px;
	}

	.flip-card-inner {
		position: relative;
		width: 100%;
		transform-style: preserve-3d;
		transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
	}

	.flip-card-inner.is-flipped {
		transform: rotateY(180deg);
	}

	.flip-card-face {
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.flip-card-back {
		position: absolute;
		inset: 0;
		transform: rotateY(180deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.flip-card-inner {
			transition: none;
		}
	}
</style>
