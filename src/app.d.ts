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

	interface Window {
		/**
		 * Exposed by the Electron preload bridge (electron/preload.cjs).
		 * Undefined in the web build, which is how desktop-only UI is gated.
		 */
		desktop?: {
			isDesktop: boolean;
			getAlwaysOnTop(): Promise<boolean>;
			setAlwaysOnTop(value: boolean): Promise<boolean>;
		};
	}
}

export {};
