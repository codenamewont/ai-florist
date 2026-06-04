<script>
	let { children } = $props();
</script>

<button class="bg-black px-6 py-3 text-white">
	{@render children()}
</button>
