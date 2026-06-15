<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import GrowthMetaphorIllustration from '$lib/components/ui/landing/GrowthMetaphorIllustration.svelte';

	function handleStart() {
		goto(resolve('/create'));
	}
</script>

<section
	class="relative flex min-h-dvh flex-col bg-surface px-6 py-8 font-sans text-ink sm:px-10 sm:py-10 lg:px-14"
	aria-label="Every bouquet starts with a muse — seed to bouquet growth metaphor"
>
	<div class="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col justify-center">
		<GrowthMetaphorIllustration />

		<p class="mt-3 text-left text-sm tracking-[0.18em] text-muted sm:mt-4 sm:text-base">
			Every Bouquet Starts with a Muse
		</p>
	</div>

	<!--
		아트워크 하단 선과 동일한 max-w-6xl 기준:
		Fleumuse — 선 왼쪽 끝 / start creating — 선 오른쪽 끝, y축 가운데 정렬
	-->
	<div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 pt-10 pb-2">
		<h1 class="text-4xl leading-none font-bold tracking-wide sm:text-5xl lg:text-6xl">
			Fleumuse
		</h1>

		<div class="shrink-0">
			<Button onclick={handleStart}>start creating</Button>
		</div>
	</div>
</section>
