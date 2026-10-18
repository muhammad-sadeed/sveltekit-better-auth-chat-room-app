<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import * as Message from '#lib/components/ui/message/index.js';
	import * as MessageScroller from '#lib/components/ui/message-scroller/index.js';
	import { Room } from '#lib/chat/room.svelte.ts';
	import ChatBackdrop from '#lib/components/chat-backdrop.svelte';
	import AlwaysOnTopToggle from '#lib/components/always-on-top-toggle.svelte';

	let { data } = $props();

	let room: Room | undefined = $state.raw();
	let text = $state('');

	onMount(() => {
		room = new Room(data.code, data.roomKey, data.iceServers, data.me);
		return () => room?.close();
	});

	function send(e: SubmitEvent) {
		e.preventDefault();
		const t = text.trim();
		if (!t) return;
		room?.send(t);
		text = '';
	}
</script>

<ChatBackdrop class="absolute inset-0 -z-10" />

<div class="mx-auto flex h-screen max-w-2xl flex-col gap-4 p-4">
	<header class="flex items-center justify-between rounded-lg bg-[#131313] px-4 py-2">
		<div>
			<h1 class="text-lg font-semibold">Room {data.code}</h1>
			<p class="text-sm text-muted-foreground">
				{Object.keys(room?.peers ?? {}).length} peer(s) linked
			</p>
		</div>
		<div class="flex gap-2">
			<AlwaysOnTopToggle variant="outline" size="icon-sm" />
			<Button variant="outline" size="sm" onclick={() => navigator.clipboard.writeText(data.code)}>
				Copy code
			</Button>
			<Button variant="outline" size="sm" href="/">Leave</Button>
		</div>
	</header>

	<MessageScroller.Provider autoScroll>
		<MessageScroller.Root class="flex-1 rounded-md border bg-[#0a0a0a]">
			<MessageScroller.Viewport>
				<MessageScroller.Content class="gap-4 px-3 py-4">
					{#each room?.messages ?? [] as m (m.id)}
						<MessageScroller.Item messageId={m.id}>
							<Message.Root align={m.mine ? 'end' : 'start'}>
								<Message.Content>
									<Message.Header>{m.mine ? 'You' : m.name}</Message.Header>
									<Bubble.Root variant={m.mine ? 'default' : 'muted'}>
										<Bubble.Content>{m.text}</Bubble.Content>
									</Bubble.Root>
								</Message.Content>
							</Message.Root>
						</MessageScroller.Item>
					{/each}
				</MessageScroller.Content>
			</MessageScroller.Viewport>
			<MessageScroller.Button />
		</MessageScroller.Root>
	</MessageScroller.Provider>

	<form onsubmit={send} class="flex gap-2">
		<Input bind:value={text} placeholder="Type a message" autocomplete="off" class="bg-[#131313]" />
		<Button type="submit">Send</Button>
	</form>
</div>
