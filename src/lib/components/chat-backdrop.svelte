<script lang="ts">
	/**
	 * Low-contrast, theme-aware curtain of speech bubbles used as a page backdrop.
	 * Draws with `currentColor`, so it inherits the surrounding text colour/opacity.
	 */
	let { class: className = '', tile = 200 }: { class?: string; tile?: number } = $props();

	const patternId = 'chat-bubble-curtain';
</script>

<div
	class={['pointer-events-none fixed inset-0 -z-10 overflow-hidden', className]}
	aria-hidden="true"
>
	<svg class="size-full text-foreground/[0.045] dark:text-foreground/[0.06]">
		<defs>
			<pattern
				id={patternId}
				width={tile}
				height={tile}
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(-4)"
			>
				<!-- incoming (left) -->
				<g fill="currentColor">
					<rect x="12" y="14" width="78" height="28" rx="14" />
					<path d="M26 41 l-4 16 l20 -15 z" />
				</g>
				<!-- outgoing (right) -->
				<g fill="currentColor" fill-opacity="0.6">
					<rect x="124" y="52" width="64" height="28" rx="14" />
					<path d="M172 79 l4 16 l-20 -15 z" />
				</g>
				<!-- incoming (left) -->
				<g fill="currentColor" fill-opacity="0.6">
					<rect x="24" y="108" width="54" height="28" rx="14" />
					<path d="M38 135 l-4 16 l20 -15 z" />
				</g>
				<!-- outgoing (right) -->
				<g fill="currentColor">
					<rect x="98" y="146" width="86" height="28" rx="14" />
					<path d="M164 173 l4 16 l-20 -15 z" />
				</g>
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#{patternId})" />
	</svg>
</div>
