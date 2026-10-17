<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Room } from '#lib/chat/room.svelte.ts';

	let { data } = $props();

	let room: Room | undefined = $state.raw();
	let text = $state('');

	onMount(() => {
		room = new Room(data.code, data.roomKey, data.me);
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

<div class="mx-auto flex h-screen max-w-2xl flex-col gap-4 p-4">
	<header class="flex items-center justify-between">
		<div>
			<h1 class="text-lg font-semibold">Room {data.code}</h1>
			<p class="text-sm text-muted-foreground">
				{Object.keys(room?.peers ?? {}).length} peer(s) linked
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={() => navigator.clipboard.writeText(data.code)}>
				Copy code
			</Button>
			<Button variant="outline" size="sm" href="/">Leave</Button>
		</div>
	</header>

	<div class="flex-1 space-y-2 overflow-y-auto rounded-md border p-3">
		{#each room?.messages ?? [] as m (m.id)}
			<div class="flex flex-col {m.mine ? 'items-end' : 'items-start'}">
				<span class="text-xs text-muted-foreground">{m.mine ? 'You' : m.name}</span>
				<span
					class="max-w-[80%] rounded-lg px-3 py-1.5 {m.mine
						? 'bg-primary text-primary-foreground'
						: 'bg-muted'}"
				>
					{m.text}
				</span>
			</div>
		{/each}
	</div>

	<form onsubmit={send} class="flex gap-2">
		<Input bind:value={text} placeholder="Type a message" autocomplete="off" />
		<Button type="submit">Send</Button>
	</form>
</div>
