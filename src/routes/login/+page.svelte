<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import ChatBackdrop from '#lib/components/chat-backdrop.svelte';
	import { signIn, signInWithGoogle, signUp } from '#lib/auth.remote.ts';
	import { toast } from 'svelte-sonner';

	let isSignUp = $state(false);

	$effect(() => {
		if (signUp.result?.error) {
			toast(signUp.result.error);
		}
		if (signIn.result?.error) {
			toast(signIn.result.error);
		}
	});

	const RAMP = ' .:-=+*#%@';
	const FONT = 12; // px, must match text-[12px] below
	const LINE = 14; // px, must match leading-[14px] below
	const CHAR_W = FONT * 0.6; // monospace glyph width

	let panel: HTMLDivElement;
	let art = $state('');
	let cols = 70;
	let rows = 40;

	function frame(t: number) {
		let out = '';
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				const px = x * 0.11;
				const py = y * 0.22; // chars are ~2x taller than wide
				let v =
					Math.sin(px + t) +
					Math.sin(py * 1.3 - t * 0.8) +
					Math.sin((px + py) * 0.7 + t * 0.6) +
					Math.sin(Math.hypot(px - cols * 0.055, py - rows * 0.11) * 1.2 - t * 1.4);
				v = (v + 4) / 8;

				out += RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
			}
			out += '\n';
		}
		return out;
	}

	onMount(() => {
		const measure = () => {
			cols = Math.ceil(panel.clientWidth / CHAR_W) + 1;
			rows = Math.ceil(panel.clientHeight / LINE) + 1;
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(panel);

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			art = frame(0);
			return () => ro.disconnect();
		}

		let raf: number;
		let last = 0;
		const loop = (now: number) => {
			if (now - last > 33) {
				art = frame(now / 1000);
				last = now;
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	});

	// The ascii panel is drawn on a fixed grid so the box stays square in any monospace face.
	// const W = 36;
	// const row = (s = '') => `│${s.padEnd(W).slice(0, W)}│`;
	// const rule = (l: string, m: string, r: string) => `${l}${m.repeat(W)}${r}`;

	// const artBefore = [
	// 	rule('┌', '─', '┐'),
	// 	row('  ●  ●  ●' + ' '.repeat(18) + 'p2p chat'),
	// 	rule('├', '─', '┤'),
	// 	row(),
	// 	row('  hey — are you still there?'.padEnd(33) + '◂'),
	// 	row(),
	// 	row('         ▸  yep. and listening.'),
	// 	row(),
	// 	row('  messages skip the server.'),
	// 	row(),
	// 	rule('├', '─', '┤'),
	// 	'│' + '  ›  type a message…'.padEnd(33)
	// ].join('\n');

	// const artAfter = '  │\n' + rule('└', '─', '┘') + '\n';
</script>

<div class="relative flex min-h-screen items-center justify-center px-6 py-10">
	<ChatBackdrop />

	<div
		class="relative grid w-full max-w-104 overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-2xl lg:max-w-208 lg:grid-cols-2"
	>
		<div
			bind:this={panel}
			class="relative hidden border-r border-foreground/10 bg-background/40 lg:block"
		>
			<pre
				aria-hidden="true"
				class="absolute inset-0 m-0 overflow-hidden font-mono text-[12px] leading-[14px] text-foreground/50 select-none">{art}</pre>
		</div>

		<Card.Root class="rounded-none border-0 bg-transparent shadow-none ring-0">
			<Card.Header>
				<Card.Title>{isSignUp ? 'Create your account' : 'Welcome back'}</Card.Title>
				<Card.Description>
					{isSignUp
						? 'Pick a name and a password to get started.'
						: 'Sign in to start or join a conversation.'}
				</Card.Description>
			</Card.Header>

			<Card.Content class="grid gap-6">
				<!-- Sliding segmented control for switching modes -->
				<div
					class="relative grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-medium"
					role="group"
					aria-label="Switch between login and sign up"
				>
					<span
						class="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-background shadow-sm ring-1 ring-foreground/5 transition-transform duration-300 ease-out motion-reduce:transition-none {isSignUp
							? 'translate-x-full'
							: 'translate-x-0'}"
					></span>
					<button
						type="button"
						aria-pressed={!isSignUp}
						class="relative z-10 rounded-full py-1.5 transition-colors {!isSignUp
							? 'text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (isSignUp = false)}
					>
						Login
					</button>
					<button
						type="button"
						aria-pressed={isSignUp}
						class="relative z-10 rounded-full py-1.5 transition-colors {isSignUp
							? 'text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (isSignUp = true)}
					>
						Sign up
					</button>
				</div>

				{#if isSignUp}
					<form id="auth-form" {...signUp}>
						<div class="flex flex-col gap-6">
							<div class="grid gap-2">
								<Label for="name">Username</Label>
								<Input
									{...signUp.fields.name.as('text')}
									id="name"
									placeholder="Username"
									autocomplete="username"
									required
								/>
							</div>
							<div class="grid gap-2">
								<Label for="email">Email</Label>
								<Input
									{...signUp.fields.email.as('email')}
									id="email"
									placeholder="m@example.com"
									autocomplete="email"
									required
								/>
							</div>
							<div class="grid gap-2">
								<Label for="password">Password</Label>
								<Input
									{...signUp.fields.password.as('password')}
									id="password"
									placeholder="At least 8 characters"
									autocomplete="new-password"
									required
								/>
							</div>
						</div>
					</form>
				{:else}
					<form id="auth-form" {...signIn}>
						<div class="flex flex-col gap-6">
							<div class="grid gap-2">
								<Label for="email">Email</Label>
								<Input
									{...signIn.fields.email.as('email')}
									id="email"
									placeholder="m@example.com"
									autocomplete="email"
									required
								/>
							</div>
							<div class="grid gap-2">
								<Label for="password">Password</Label>
								<Input
									{...signIn.fields.password.as('password')}
									id="password"
									placeholder="Password"
									autocomplete="current-password"
									required
								/>
							</div>
						</div>
					</form>
				{/if}
			</Card.Content>

			<Card.Footer class="flex-col gap-4">
				<Button
					type="submit"
					form="auth-form"
					class="w-full"
					loading={isSignUp ? signUp.pending > 0 : signIn.pending > 0}
				>
					{isSignUp ? 'Create account' : 'Login'}
				</Button>

				<div class="flex w-full items-center gap-3">
					<span class="h-px flex-1 bg-border"></span>
					<span class="text-xs text-muted-foreground">or</span>
					<span class="h-px flex-1 bg-border"></span>
				</div>

				<form {...signInWithGoogle} class="w-full">
					<Button
						type="submit"
						variant="outline"
						class="w-full"
						loading={signInWithGoogle.pending > 0}
					>
						Continue with Google
					</Button>
				</form>
			</Card.Footer>
		</Card.Root>
	</div>
</div>

<style>
	@keyframes caret-blink {
		0%,
		45% {
			opacity: 1;
		}
		50%,
		95% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	.caret {
		animation: caret-blink 1.1s steps(1, end) infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.caret {
			animation: none;
		}
	}
</style>
