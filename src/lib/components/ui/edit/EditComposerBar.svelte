<script>
	let { class: klass = '', children } = $props();
</script>

<div
	class={[
		'fixed right-0 bottom-0 left-0 z-20 space-y-1.5 bg-placeholder/30 px-4 pb-5 lg:static lg:mx-auto lg:w-full lg:max-w-2xl lg:bg-transparent lg:px-6 lg:pb-0',
		klass
	]}
>
	{@render children()}
</div>
