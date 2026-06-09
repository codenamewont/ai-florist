<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MessageForm from '$lib/components/ui/message/MessageForm.svelte';
	import { getFlowObject, loadFlow, saveFlow } from '$lib/flowerFlow/session.js';

	const flow = loadFlow();
	const userInput = getFlowObject('userInput') ?? {};

	let message = $state(typeof flow.cardMessage === 'string' ? flow.cardMessage : '');
	let error = $state('');

	const artworkTitle = $derived(message ? 'Your message' : 'Title');

	const artworkDescription = $derived(message || 'Description Description Description');

	function handleContinue() {
		const current = loadFlow();
		if (!current.jobId) {
			error = 'Please upload an image first.';
			goto(resolve('/upload'));
			return;
		}

		const mergedNotes = [userInput.notes, message ? `Card message: ${message}` : '']
			.filter(Boolean)
			.join('\n\n');

		saveFlow({
			cardMessage: message,
			userInput: { ...userInput, notes: mergedNotes || undefined }
		});

		goto(resolve('/generating'));
	}
</script>

<!--
	create / upload와 같은 2열 레이아웃.
	우측 MessageForm에서 프리셋 메시지를 pill 버튼으로 선택합니다.
-->
<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={3} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork title={artworkTitle} description={artworkDescription} />

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
			<MessageForm bind:message />

			<div
				class="fixed right-0 bottom-0 left-0 z-20 space-y-2 px-4 pb-5 lg:absolute lg:right-8 lg:bottom-8 lg:left-auto lg:w-72 lg:px-0"
			>
				{#if error}
					<p class="rounded bg-surface/95 px-3 py-2 text-sm text-red-600 ring-1 ring-black/5">
						{error}
					</p>
				{/if}
				<button
					type="button"
					onclick={handleContinue}
					class="w-full bg-pill px-4 py-3 text-sm text-surface"
				>
					Continue to generating
				</button>
			</div>
		</section>
	</main>
</div>
