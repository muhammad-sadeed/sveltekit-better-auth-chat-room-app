// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('better-auth').User | null;
			session: import('better-auth').Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	/**
	 * Updater state pushed from the Electron main process. Mirrors the typedef
	 * in electron/main.mjs — keep the two in sync.
	 */
	type DesktopUpdateStatus =
		| { state: 'idle' }
		| { state: 'checking' }
		| { state: 'available'; version: string; releaseDate?: string; releaseNotes?: string }
		| { state: 'none'; version: string }
		| {
				state: 'downloading';
				percent: number;
				transferred: number;
				total: number;
				bytesPerSecond: number;
		  }
		| { state: 'downloaded'; version: string }
		| { state: 'error'; message: string };

	interface Window {
		/**
		 * Exposed by the Electron preload bridge (electron/preload.cjs).
		 * Undefined in the web build, which is how desktop-only UI is gated.
		 */
		desktop?: {
			isDesktop: boolean;
			getAlwaysOnTop(): Promise<boolean>;
			setAlwaysOnTop(value: boolean): Promise<boolean>;
			/** Installed shell version (app.getVersion()). */
			getVersion(): Promise<string>;
			updates?: {
				getState(): Promise<DesktopUpdateStatus>;
				check(): Promise<DesktopUpdateStatus>;
				download(): Promise<void>;
				install(): Promise<void>;
				/** Returns an unsubscribe function. */
				onStatus(callback: (status: DesktopUpdateStatus) => void): () => void;
			};
		};
	}
}

export {};
