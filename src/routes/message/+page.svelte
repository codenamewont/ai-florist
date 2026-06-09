<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import { getFlowObject, loadFlow, saveFlow } from '$lib/flowerFlow/session.js';

	const flow = loadFlow();
	const userInput = getFlowObject('userInput') ?? {};

	let recipientName = $state(flow.recipientName ?? '');
	let cardMessage = $state(flow.cardMessage ?? '');
	let deliveryNotes = $state(flow.deliveryNotes ?? '');

	function handleSubmit(event) {
		event.preventDefault();

		const current = loadFlow();
		if (!current.jobId) {
			alert('Upload an image first.');
			goto(resolve('/upload'));
			return;
		}

		const mergedNotes = [
			userInput.notes,
			recipientName ? `Recipient: ${recipientName}` : '',
			cardMessage ? `Card message: ${cardMessage}` : '',
			deliveryNotes ? `Delivery notes: ${deliveryNotes}` : ''
		]
			.filter(Boolean)
			.join('\n\n');

		saveFlow({
			recipientName,
			cardMessage,
			deliveryNotes,
			userInput: { ...userInput, notes: mergedNotes || undefined }
		});

		goto(resolve('/generating'));
	}
</script>

<div class="min-h-dvh bg-surface text-ink">
	<Header step={3} total={7} />

	<main class="mx-auto max-w-xl px-6 py-10">
		<h1 class="mb-2 text-2xl">Message</h1>
		<p class="mb-8 text-sm text-muted">Add details for the florist and card message.</p>

		<form onsubmit={handleSubmit} class="space-y-5">
			<label class="block space-y-2">
				<span class="text-sm">Recipient name</span>
				<input bind:value={recipientName} class="w-full border border-line bg-surface px-3 py-2" />
			</label>

			<label class="block space-y-2">
				<span class="text-sm">Card message</span>
				<textarea
					bind:value={cardMessage}
					rows="4"
					class="w-full border border-line bg-surface px-3 py-2"
					placeholder="Happy birthday! Wishing you a soft and lovely day."
				></textarea>
			</label>

			<label class="block space-y-2">
				<span class="text-sm">Delivery notes</span>
				<textarea
					bind:value={deliveryNotes}
					rows="3"
					class="w-full border border-line bg-surface px-3 py-2"
					placeholder="Please keep the bouquet airy and not too structured."
				></textarea>
			</label>

			<button type="submit" class="bg-pill px-6 py-3 text-sm text-surface"
				>Continue to generating</button
			>
		</form>
	</main>
</div>
