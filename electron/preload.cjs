// Preload runs in an isolated world with `sandbox: true`, so it must be CommonJS
// (hence the `.cjs` extension) and may only touch `electron` + a few builtins.
// It exposes a minimal, explicit surface on `window.desktop` — the renderer never
// gets direct access to ipcRenderer or Node.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- sandboxed preloads must be CommonJS
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
	// The web build has no preload, so this marker is how the UI knows to render
	// desktop-only controls (see AlwaysOnTopToggle / DesktopUpdate).
	isDesktop: true,
	getAlwaysOnTop: () => ipcRenderer.invoke('window:get-always-on-top'),
	setAlwaysOnTop: (value) => ipcRenderer.invoke('window:set-always-on-top', Boolean(value)),
	getVersion: () => ipcRenderer.invoke('app:get-version'),
	updates: {
		getState: () => ipcRenderer.invoke('update:get-state'),
		check: () => ipcRenderer.invoke('update:check'),
		download: () => ipcRenderer.invoke('update:download'),
		install: () => ipcRenderer.invoke('update:install'),
		// Subscribe to updater state pushed by the main process. Returns an
		// unsubscribe function (contextBridge proxies functions both ways).
		onStatus: (callback) => {
			const listener = (_event, status) => callback(status);
			ipcRenderer.on('update:status', listener);
			return () => ipcRenderer.removeListener('update:status', listener);
		}
	}
});
