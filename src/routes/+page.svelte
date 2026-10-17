<script>
	import { getUser, signOut, deleteAccount } from '#lib/auth.remote.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import Toggle from '#lib/components/ui/theme-toggle/Toggle.svelte';
</script>

<svelte:boundary>
	<Toggle />
	<h1>Hello {(await getUser()).name}</h1>
	<form {...signOut}>
		<Button type="submit">Sign out</Button>
	</form>

	<form {...deleteAccount}>
		<Button type="submit" variant="destructive">Delete Account</Button>
	</form>

	{#snippet pending()}<p>Loading…</p>{/snippet}
</svelte:boundary>
