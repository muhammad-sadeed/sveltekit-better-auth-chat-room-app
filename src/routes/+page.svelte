<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { getUser, signOut } from '#lib/auth.remote.ts';
	import { createRoom, joinRoom } from '#lib/rooms.remote.ts';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { LogOut, MessageCircle, Plus, LogIn } from '@lucide/svelte';
	import ChatBackdrop from '#lib/components/chat-backdrop.svelte';
	import ToggleTheme from '#lib/components/ui/theme-toggle/Toggle.svelte';
</script>

<ChatBackdrop class="absolute inset-0 -z-10" />

<svelte:boundary>
	{#snippet pending()}
		<div class="flex min-h-screen flex-col">
			<header class="flex items-center justify-between border-b px-6 py-3">
				<div class="flex items-center gap-2">
					<Skeleton class="size-5 rounded-md" />
					<Skeleton class="h-4 w-20" />
				</div>
				<div class="flex items-center gap-3">
					<Skeleton class="size-8 rounded-full" />
					<Skeleton class="hidden h-4 w-16 sm:block" />
					<Skeleton class="h-8 w-24 rounded-full" />
				</div>
			</header>

			<main class="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-12">
				<div class="space-y-3">
					<Skeleton class="h-8 w-72 max-w-full" />
					<Skeleton class="h-5 w-96 max-w-full" />
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<Card.Root>
						<Card.Header>
							<Skeleton class="h-5 w-32" />
							<Skeleton class="h-4 w-56 max-w-full" />
						</Card.Header>
						<Card.Footer class="mt-auto">
							<Skeleton class="h-9 w-full rounded-full" />
						</Card.Footer>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Skeleton class="h-5 w-28" />
							<Skeleton class="h-4 w-48 max-w-full" />
						</Card.Header>
						<Card.Content class="grid gap-2">
							<Skeleton class="h-4 w-20" />
							<Skeleton class="h-9 w-full rounded-full" />
						</Card.Content>
						<Card.Footer class="mt-auto">
							<Skeleton class="h-9 w-full rounded-full" />
						</Card.Footer>
					</Card.Root>
				</div>
			</main>
		</div>
	{/snippet}
</svelte:boundary>

<div class="flex min-h-screen flex-col">
	<header class="flex justify-center px-6 py-3">
		<nav
			class="flex h-14 w-96 max-w-full items-center justify-between rounded-2xl border bg-background px-5 shadow-sm"
		>
			<MessageCircle class="size-5" />

			<div class="flex items-center gap-2.5">
				<span
					class="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium"
				>
					{(await getUser()).name?.[0]?.toUpperCase() ?? '?'}
				</span>
				<span class="text-sm font-medium">{(await getUser()).name}</span>
			</div>

			<div class="flex items-center gap-2">
				<ToggleTheme />
				<form {...signOut}>
					<Button
						type="submit"
						variant="ghost"
						size="icon"
						class="size-9 rounded-lg"
						loading={signOut.pending > 0}
					>
						<LogOut class="size-5" />
					</Button>
				</form>
			</div>
		</nav>
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
						<Button type="submit" class="w-full" loading={createRoom.pending > 0}>
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
						<Button type="submit" variant="outline" class="w-full" loading={joinRoom.pending > 0}>
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
