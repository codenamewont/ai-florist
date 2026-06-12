<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import DevSeedButton from '$lib/components/dev/DevSeedButton.svelte';
	import FlowerCursor from '$lib/components/ui/FlowerCursor.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Orbit&display=swap" rel="stylesheet" />
</svelte:head>
{@render children()}
<FlowerCursor />
<DevSeedButton />
