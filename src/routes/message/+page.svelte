<script>
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MessageForm from '$lib/components/ui/message/MessageForm.svelte';
	import { skipDevImages } from '$lib/flowerFlow/devSeed.js';
	import {
		consumeDevMessageSnapshot,
		deleteFlowKey,
		getFlowObject,
		getFlowUserInput,
		isDevSeeded,
		loadFlow,
		saveFlow
	} from '$lib/flowerFlow/session.js';

	const userInput = getFlowUserInput();

	// 항상 빈 메시지로 시작 — Dev Fill은 onMount에서 1회만 스냅샷 적용
	let message = $state('');
	let error = $state('');
	let skipping = $state(false);

	const artworkTitle = $derived(message ? 'Your message' : 'Title');

	const artworkDescription = $derived(message || 'Description Description Description');

	onMount(() => {
		const hadSnapshot = !!getFlowObject('devMessageSnapshot');
		const snap = consumeDevMessageSnapshot();

		if (snap) {
			message = snap;
			return;
		}

		// 예전 세션에 devSeeded / cardMessage만 남은 경우 — 더미 메시지 복원 차단
		if (isDevSeeded() && !hadSnapshot) {
			deleteFlowKey('devSeeded');
			deleteFlowKey('devUpload');
			deleteFlowKey('cardMessage');
		}
	});

	function handleContinue() {
		const current = loadFlow();
		if (!current.jobId) {
			error = 'Please upload an image first.';
			goto(resolve('/upload'));
			return;
		}

		saveMessageToFlow();
		goto(resolve('/generating'));
	}

	function saveMessageToFlow() {
		const mergedNotes = message ? `Card message: ${message}` : '';

		saveFlow({
			cardMessage: message,
			userInput: { ...userInput, notes: mergedNotes || undefined }
		});
	}

	async function skipWithDummyImages() {
		const current = loadFlow();
		const jobId = typeof current.jobId === 'string' ? current.jobId : '';

		if (!jobId) {
			error = 'Please upload an image first.';
			goto(resolve('/upload'));
			return;
		}

		skipping = true;
		error = '';
		saveMessageToFlow();

		const result = await skipDevImages(jobId);

		if (!result.ok) {
			skipping = false;
			error = result.error;
			return;
		}

		await goto(resolve('/options'));
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
				{#if dev}
					<button
						type="button"
						disabled={skipping}
						onclick={skipWithDummyImages}
						class="w-full rounded border border-dashed border-subtle/60 px-4 py-2.5 text-xs text-muted hover:border-subtle hover:text-ink disabled:opacity-50"
						title="AI 생성 없이 더미 이미지로 options로 이동 (개발용)"
					>
						{skipping ? 'Skipping…' : 'Dev: Skip to options (dummy images)'}
					</button>
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
