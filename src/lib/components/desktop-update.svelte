<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const TOAST_ID = 'desktop-update';

	/**
	 * Desktop-only updater notifications.
	 *
	 * Renders nothing: the Electron main process owns the check/download/install
	 * lifecycle and pushes state across the preload bridge. The web build has no
	 * `window.desktop.updates`, so this is a no-op there.
	 */
	onMount(() => {
		const desktop = window.desktop;
		const updates = desktop?.updates;
		if (!desktop?.isDesktop || !updates) return;

		let currentVersion = '';
		let lastPercent = -1;
		let dismissedFor: string | null = null;
		let receivedEvent = false;

		const show = (status: DesktopUpdateStatus) => {
			switch (status.state) {
				case 'available': {
					if (dismissedFor === status.version) return;
					lastPercent = -1;
					toast.info('Update available', {
						id: TOAST_ID,
						description: currentVersion
							? `v${currentVersion} → v${status.version} is ready to download.`
							: `v${status.version} is ready to download.`,
						duration: Infinity,
						closeButton: true,
						action: { label: 'Update', onClick: () => void updates.download() },
						onDismiss: () => (dismissedFor = status.version)
					});
					break;
				}
				case 'downloading': {
					const percent = Math.round(status.percent);
					if (percent === lastPercent) return;
					lastPercent = percent;
					toast.loading('Downloading update…', {
						id: TOAST_ID,
						description: `${percent}%`,
						duration: Infinity
					});
					break;
				}
				case 'downloaded':
					lastPercent = -1;
					toast.success('Update ready to install', {
						id: TOAST_ID,
						description: `v${status.version} downloaded. Restart to finish.`,
						duration: Infinity,
						closeButton: true,
						action: { label: 'Restart', onClick: () => void updates.install() }
					});
					break;
				case 'error':
					lastPercent = -1;
					toast.error('Update failed', {
						id: TOAST_ID,
						description: status.message,
						duration: 10_000,
						closeButton: true
					});
					break;
				// Background checks are intentionally silent; only actionable
				// states surface to the user.
				case 'idle':
				case 'checking':
				case 'none':
					break;
			}
		};

		// Subscribe before asking for the cached state, then ignore the snapshot
		// if a live event already arrived (otherwise a stale reply could
		// overwrite a newer state).
		const unsubscribe = updates.onStatus((status) => {
			receivedEvent = true;
			show(status);
		});
		void desktop
			.getVersion()
			.then((version) => (currentVersion = version))
			.catch(() => {});
		void updates
			.getState()
			.then((status) => {
				if (!receivedEvent) show(status);
			})
			.catch(() => {});

		return unsubscribe;
	});
</script>
