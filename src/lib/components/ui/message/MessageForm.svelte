<script>
	import MessagePresetList from './MessagePresetList.svelte';

	let { message = $bindable('') } = $props();

	const presets = [
		'Happy Birthday!',
		'Thank you for always being there',
		'I love you',
		"I'm proud of you",
		'Congratulations!',
	];

	const selectedPreset = $derived(presets.find((preset) => preset === message) ?? null);
</script>

<div class="flex flex-1 flex-col justify-center px-6 py-10 md:px-12 lg:px-16 lg:py-16">
	<header class="mb-8 lg:mb-10">
		<textarea
			bind:value={message}
			placeholder="Write something from your heart"
			rows="1"
			aria-label="Write your message"
			class="w-full resize-none border-none bg-transparent text-3xl leading-relaxed font-light text-ink placeholder:text-muted focus:outline-none md:text-4xl lg:text-[2.75rem]"
		></textarea>
		<div class="mt-6 border-b border-pill lg:mt-3"></div>
	</header>

	<MessagePresetList
		options={presets}
		selected={selectedPreset}
		onchange={(preset) => (message = preset)}
	/>
</div>
