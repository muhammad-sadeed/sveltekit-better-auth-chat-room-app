import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	MONGODB_URI: {},
	BETTER_AUTH_SECRET: {},
	BETTER_AUTH_URL: {},
	GOOGLE_CLIENT_ID: {},
	GOOGLE_CLIENT_SECRET: {},
	TURN_URL: {},
	TURN_SECRET: {}
});
