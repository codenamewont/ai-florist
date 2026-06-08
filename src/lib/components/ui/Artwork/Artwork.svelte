<script>
	// The exhibited artwork — always shown on the left, acting like a step indicator.
	import Vase from './Vase.svelte';
	import DescriptionCard from './DescriptionCard.svelte';

	let { title = 'Title', description = 'Description Description Description' } = $props();
</script>

<section
	class="flex w-full shrink-0 flex-col border-b border-line lg:min-h-0 lg:w-[44%] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
>
	<!-- mobile: compact row · desktop: centered column -->
	<div
		class="mx-auto flex w-full max-w-100 flex-row items-center gap-12 px-6 py-5 lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:gap-10 lg:px-6 lg:py-12"
	>
		<Vase />
		<DescriptionCard {title} {description} />
	</div>
</section>
