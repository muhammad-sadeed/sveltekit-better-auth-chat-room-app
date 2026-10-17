import { betterAuth } from 'better-auth/minimal';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { MongoClient } from 'mongodb';
import {
	MONGODB_URI,
	BETTER_AUTH_URL,
	BETTER_AUTH_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$app/env/private';

const client = new MongoClient(MONGODB_URI);
const db = client.db('myapp');

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	database: mongodbAdapter(db), // don't pass `client`: a standalone local mongod has no transactions
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID as string,
			clientSecret: GOOGLE_CLIENT_SECRET as string
		}
	},
	emailAndPassword: { enabled: true },
	plugins: [sveltekitCookies(getRequestEvent)], // lets auth.api.* set cookies from remote functions
	advanced: {
		useSecureCookies: true
	},
	user: {
		deleteUser: {
			enabled: true
		}
	}
});
