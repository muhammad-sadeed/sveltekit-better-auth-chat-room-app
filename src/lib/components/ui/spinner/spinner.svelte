<script lang="ts">
	import { cn, type WithElementRef } from '#lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
	bind:this={ref}
	data-slot="spinner"
	role="status"
	aria-label="Loading"
	class={cn(
		'size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
		className
	)}
	{...restProps}
></span>
