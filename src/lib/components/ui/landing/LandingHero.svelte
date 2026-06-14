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

	<div class="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 pb-2 pt-10">
		<div class="min-w-0 text-left">
			<p class="text-lg leading-none tracking-wide text-ink">AI Florist</p>
			<h1 class="mt-2 text-4xl leading-none font-bold tracking-wide sm:text-5xl lg:text-6xl">
				DearYou
			</h1>
		</div>

		<div class="shrink-0 pb-1">
			<Button onclick={handleStart}>start creating</Button>
		</div>
	</div>
</section>
