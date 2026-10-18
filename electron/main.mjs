import { app, BrowserWindow, shell } from 'electron';

// Dev mode is enabled by the `electron:dev` script (vite dev server is managed
// externally via concurrently/wait-on) and points at the local dev server.
const isDev = process.env.ELECTRON_DEV === '1';

const DEV_URL = 'http://localhost:5173';
// Production: the deployed web app IS the backend. The window loads it directly,
// so all /api/auth, remote-function and OAuth callback traffic hits the hosted
// SvelteKit server and no secrets are shipped inside the desktop bundle.
const PROD_URL =
	process.env.DESKTOP_APP_URL || 'https://sveltekit-better-auth-chat-room-app.vercel.app';

/** @type {BrowserWindow | null} */
let win = null;

/**
 * @param {string} url
 */
function createWindow(url) {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		title: 'P2P Chat',
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true
		}
	});

	// Keep app-origin and OAuth popups inside Electron (they share the session,
	// so sign-in cookies land in the app), send other external links to the browser.
	const allowedPopupPrefixes = isDev ? [DEV_URL] : [PROD_URL, 'https://accounts.google.com'];
	win.webContents.setWindowOpenHandler(({ url: openUrl }) => {
		if (allowedPopupPrefixes.some((prefix) => openUrl.startsWith(prefix))) {
			return { action: 'allow' };
		}
		shell.openExternal(openUrl);
		return { action: 'deny' };
	});

	win.loadURL(url);
}

app.whenReady().then(() => {
	createWindow(isDev ? DEV_URL : PROD_URL);
});

app.on('window-all-closed', () => {
	app.quit();
});
