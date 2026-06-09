<script>
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MessageForm from '$lib/components/ui/message/MessageForm.svelte';

	let message = $state('');

	const artworkTitle = $derived(message ? 'Your message' : 'Title');

	const artworkDescription = $derived(message || 'Description Description Description');
</script>

<!--
	create / upload와 같은 2열 레이아웃.
	우측 MessageForm에서 프리셋 메시지를 pill 버튼으로 선택합니다.
-->
<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={4} total={6} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork title={artworkTitle} description={artworkDescription} />

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
			<MessageForm bind:message />
		</section>
	</main>
</div>
