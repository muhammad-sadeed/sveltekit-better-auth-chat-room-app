import { app, BrowserWindow, ipcMain, shell } from 'electron';
import electronUpdater from 'electron-updater';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { autoUpdater } = electronUpdater;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dev mode is enabled by the `electron:dev` script (vite dev server is managed
// externally via concurrently/wait-on) and points at the local dev server.
const isDev = process.env.ELECTRON_DEV === '1';

const DEV_URL = 'http://localhost:5173';
// Production: the deployed web app IS the backend. The window loads it directly,
// so all /api/auth, remote-function and OAuth callback traffic hits the hosted
// SvelteKit server and no secrets are shipped inside the desktop bundle.
const PROD_URL =
	process.env.DESKTOP_APP_URL || 'https://sveltekit-better-auth-chat-room-app.vercel.app';

// How often to look for a newer shell in the background. Web changes ship
// instantly via Vercel; this only covers new Electron builds.
const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** @type {BrowserWindow | null} */
let win = null;

/**
 * Mirrors `DesktopUpdateStatus` in src/app.d.ts — keep the two in sync.
 * @typedef {object} UpdateStatus
 * @property {'idle' | 'checking' | 'available' | 'none' | 'downloading' | 'downloaded' | 'error'} state
 * @property {string} [version]
 * @property {string} [releaseDate]
 * @property {string} [releaseNotes]
 * @property {number} [percent]
 * @property {number} [transferred]
 * @property {number} [total]
 * @property {number} [bytesPerSecond]
 * @property {string} [message]
 */

/**
 * Latest updater state, cached so a renderer that mounts late (or reloads) can
 * ask for it instead of missing events fired before it subscribed.
 * @type {UpdateStatus}
 */
let updateStatus = { state: 'idle' };

/** True only while a user-requested download is running. */
let downloading = false;

/** Updaters only make sense for a packaged build with a configured feed. */
const canAutoUpdate = app.isPackaged && !isDev;

/**
 * @param {UpdateStatus} status
 */
function publishUpdateStatus(status) {
	updateStatus = status;
	if (win && !win.isDestroyed()) {
		win.webContents.send('update:status', status);
	}
}

/**
 * electron-updater gives `releaseNotes` as a string or an array of notes.
 * The bridge can only send structured-cloneable, simple values.
 * @param {string | import('electron-updater').ReleaseNoteInfo[] | null | undefined} notes
 */
function normalizeReleaseNotes(notes) {
	if (!notes) return undefined;
	if (typeof notes === 'string') return notes;
	return notes.map((note) => note.note ?? '').join('\n') || undefined;
}

function setupAutoUpdates() {
	if (!canAutoUpdate) return;

	// The user chooses when to download; the install itself still happens
	// automatically on quit if they dismiss the prompt.
	autoUpdater.autoDownload = false;
	autoUpdater.autoInstallOnAppQuit = true;

	autoUpdater.on('checking-for-update', () => publishUpdateStatus({ state: 'checking' }));

	autoUpdater.on('update-available', (info) => {
		publishUpdateStatus({
			state: 'available',
			version: info.version,
			releaseDate: info.releaseDate,
			releaseNotes: normalizeReleaseNotes(info.releaseNotes)
		});
	});

	autoUpdater.on('update-not-available', (info) => {
		publishUpdateStatus({ state: 'none', version: info.version });
	});

	autoUpdater.on('download-progress', (progress) => {
		publishUpdateStatus({
			state: 'downloading',
			percent: progress.percent,
			transferred: progress.transferred,
			total: progress.total,
			bytesPerSecond: progress.bytesPerSecond
		});
	});

	autoUpdater.on('update-downloaded', (info) => {
		downloading = false;
		publishUpdateStatus({ state: 'downloaded', version: info.version });
	});

	autoUpdater.on('error', (error) => {
		// Background check failures (offline, feed not published yet, unsigned
		// macOS build) are not actionable for the user. Only surface problems
		// with a download the user actually asked for.
		if (!downloading) {
			console.warn('[updater] background check failed:', error?.message ?? error);
			return;
		}
		downloading = false;
		publishUpdateStatus({
			state: 'error',
			message: error?.message ?? String(error)
		});
	});

	const check = () => {
		// Never interrupt an in-flight download: a check could emit
		// update-available again and reset the renderer's progress toast.
		if (downloading) return;
		autoUpdater.checkForUpdates().catch((error) => {
			console.warn('[updater] check failed:', error?.message ?? error);
		});
	};

	check();
	const timer = setInterval(check, UPDATE_CHECK_INTERVAL_MS);
	app.on('before-quit', () => clearInterval(timer));
}

// Desktop-only: "always on top" is driven from the renderer via the preload
// bridge. The web build never loads a preload, so it can't reach these handlers.
ipcMain.handle('window:get-always-on-top', () => win?.isAlwaysOnTop() ?? false);
ipcMain.handle('window:set-always-on-top', (_event, value) => {
	win?.setAlwaysOnTop(Boolean(value));
	return win?.isAlwaysOnTop() ?? false;
});

// Desktop-only update bridge (see electron/preload.cjs and DesktopUpdate.svelte).
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('update:get-state', () => updateStatus);
ipcMain.handle('update:check', async () => {
	if (canAutoUpdate && !downloading) {
		try {
			await autoUpdater.checkForUpdates();
		} catch (error) {
			console.warn('[updater] check failed:', error?.message ?? error);
		}
	}
	return updateStatus;
});
ipcMain.handle('update:download', async () => {
	if (!canAutoUpdate || updateStatus.state !== 'available') return;
	downloading = true;
	try {
		await autoUpdater.downloadUpdate();
	} catch (error) {
		// The 'error' listener publishes the failure; swallow the rejection so
		// the renderer's invoke() does not throw.
		console.warn('[updater] download failed:', error?.message ?? error);
	}
});
ipcMain.handle('update:install', () => {
	if (!canAutoUpdate) return;
	// Closes the app, runs the installer, and relaunches on Windows/macOS.
	autoUpdater.quitAndInstall();
});

/**
 * @param {string} url
 */
function createWindow(url) {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		title: 'P2P Chat',
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
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
	setupAutoUpdates();
	createWindow(isDev ? DEV_URL : PROD_URL);
});

app.on('window-all-closed', () => {
	app.quit();
});
