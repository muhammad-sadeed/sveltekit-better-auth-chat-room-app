<script lang="ts">
	import { onMount } from 'svelte';
	import PinIcon from '@lucide/svelte/icons/pin';
	import { Button, type ButtonSize, type ButtonVariant } from '#lib/components/ui/button/index.js';

	let { variant = 'ghost', size = 'icon' }: { variant?: ButtonVariant; size?: ButtonSize } =
		$props();

	// `window.desktop` only exists when the page is loaded by the Electron shell
	// (electron/preload.cjs). On the web it's undefined, so nothing renders — and
	// because we start at `false`, the server and first client render match.
	let available = $state(false);
	let onTop = $state(false);
	let busy = $state(false);

	onMount(() => {
		const api = window.desktop;
		if (!api?.isDesktop) return;
		available = true;
		api
			.getAlwaysOnTop()
			.then((value) => (onTop = value))
			.catch(() => {});
	});

	async function toggle() {
		const api = window.desktop;
		if (!api || busy) return;
		busy = true;
		try {
			onTop = await api.setAlwaysOnTop(!onTop);
		} finally {
			busy = false;
		}
	}
</script>

{#if available}
	<Button
		{variant}
		{size}
		aria-pressed={onTop}
		title={onTop ? 'Stop keeping this window on top' : 'Keep this window on top'}
		class={onTop ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}
		onclick={toggle}
	>
		<PinIcon class="size-5 {onTop ? 'fill-current' : ''}" />
		<span class="sr-only">Always on top</span>
	</Button>
{/if}
