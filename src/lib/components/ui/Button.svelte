<script>
	let { children, onclick = undefined } = $props();
</script>

<button class="bg-black px-6 py-3 text-white" {onclick}>
	{@render children()}
</button>
