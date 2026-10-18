import { betterAuth } from 'better-auth/minimal';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { bearer } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { db } from './mongo';
import {
	BETTER_AUTH_URL,
	BETTER_AUTH_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$app/env/private';

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	database: mongodbAdapter(db),
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID as string,
			clientSecret: GOOGLE_CLIENT_SECRET as string
		}
	},
	emailAndPassword: { enabled: true },
	plugins: [sveltekitCookies(getRequestEvent), bearer()],
	trustedOrigins: [BETTER_AUTH_URL, 'http://localhost:5173', 'myapp://*'],
	advanced: {
		useSecureCookies: true,
		defaultCookieAttributes: {
			sameSite: 'none',
			secure: true
		}
	},
	user: {
		deleteUser: {
			enabled: true
		}
	}
});
