<script>
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { signIn, signInWithGoogle, signUp } from '#lib/auth.remote.ts';

	let isSignUp = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>{isSignUp ? 'Create an account' : 'Login to your account'}</Card.Title>
			<Card.Description>
				{isSignUp ? 'Enter your details below to sign up' : 'Enter your email below to login'}
			</Card.Description>
			<Card.Action>
				<Button type="button" variant="link" onclick={() => (isSignUp = !isSignUp)}>
					{isSignUp ? 'Login' : 'Sign Up'}
				</Button>
			</Card.Action>
		</Card.Header>

		<Card.Content>
			{#if isSignUp}
				<form id="auth-form" {...signUp}>
					<div class="flex flex-col gap-6">
						<div class="grid gap-2">
							<Label for="name">Username</Label>
							<Input {...signUp.fields.name.as('text')} id="name" placeholder="Username" required />
						</div>
						<div class="grid gap-2">
							<Label for="email">Email</Label>
							<Input
								{...signUp.fields.email.as('email')}
								id="email"
								placeholder="m@example.com"
								required
							/>
						</div>
						<div class="grid gap-2">
							<Label for="password">Password</Label>
							<Input
								{...signUp.fields.password.as('password')}
								id="password"
								placeholder="Password"
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
								required
							/>
						</div>
						<div class="grid gap-2">
							<Label for="password">Password</Label>
							<Input
								{...signIn.fields.password.as('password')}
								id="password"
								placeholder="Password"
								required
							/>
						</div>
					</div>
				</form>
			{/if}
		</Card.Content>

		<Card.Footer class="flex-col gap-2">
			<Button type="submit" form="auth-form" class="w-full">
				{isSignUp ? 'Create account' : 'Login'}
			</Button>

			<form {...signInWithGoogle} class="w-full">
				<Button type="submit" variant="outline" class="w-full">Continue with Google</Button>
			</form>
		</Card.Footer>
	</Card.Root>
</div>
