<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { signOut } from '#lib/auth.remote.ts';
	import { createRoom, joinRoom } from '#lib/rooms.remote.ts';
	import { LogOut, MessageCircle, Plus, LogIn } from '@lucide/svelte';

	// let { data } = $props();

	// const initial = $derived(data.user.name?.[0]?.toUpperCase() ?? '?');
</script>

<div class="flex min-h-screen flex-col">
	<header class="flex items-center justify-between border-b px-6 py-3">
		<div class="flex items-center gap-2 font-semibold">
			<MessageCircle class="size-5" />
			<span>P2P Chat</span>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<span
					class="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium"
				>
					<!-- {initial} -->
				</span>
				<!-- <span class="hidden text-sm sm:inline">{data.user.name}</span> -->
			</div>
			<form {...signOut}>
				<Button type="submit" variant="ghost" size="sm">
					<LogOut class="size-4" />
					Sign out
				</Button>
			</form>
		</div>
	</header>

	<main class="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-12">
		<div class="space-y-2">
			<h1 class="text-3xl font-semibold tracking-tight">Start a conversation</h1>
			<p class="text-muted-foreground">
				Create a room and share its code, or join one you've been given.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Create a room</Card.Title>
					<Card.Description>Get a 6-character code to share with others.</Card.Description>
				</Card.Header>
				<Card.Footer class="mt-auto">
					<form {...createRoom} class="w-full">
						<Button type="submit" class="w-full">
							<Plus class="size-4" />
							Create room
						</Button>
					</form>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<form {...joinRoom} class="flex h-full flex-col gap-6">
					<Card.Header>
						<Card.Title>Join a room</Card.Title>
						<Card.Description>Enter the code you were given.</Card.Description>
					</Card.Header>

					<Card.Content class="grid gap-2">
						<Label for="code">Room code</Label>
						<Input
							{...joinRoom.fields.code.as('text')}
							id="code"
							placeholder="ABC123"
							maxlength={6}
							autocomplete="off"
							required
							class="text-center font-mono text-lg tracking-[0.3em] uppercase"
						/>
						{#if joinRoom.result?.error}
							<p class="text-sm text-destructive">{joinRoom.result.error}</p>
						{/if}
					</Card.Content>

					<Card.Footer class="mt-auto">
						<Button type="submit" variant="outline" class="w-full">
							<LogIn class="size-4" />
							Join room
						</Button>
					</Card.Footer>
				</form>
			</Card.Root>
		</div>

		<p class="text-center text-xs text-muted-foreground">
			Messages travel directly between browsers. The server only helps you find each other.
		</p>
	</main>
</div>
