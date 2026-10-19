<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import type { LayoutProps } from './$types';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import DesktopUpdate from '#lib/components/desktop-update.svelte';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster />
<DesktopUpdate />
{@render children()}
