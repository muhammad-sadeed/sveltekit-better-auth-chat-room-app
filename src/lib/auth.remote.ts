import { form, query, getRequestEvent } from '$app/server';
import { redirect, error } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '#lib/server/auth.ts';

const creds = z.object({
	email: z.email(),
	password: z.string().min(8)
});

export const signIn = form(creds, async ({ email, password }) => {
	try {
		await auth.api.signInEmail({ body: { email, password } });
	} catch (caughtError) {
		if (caughtError instanceof Error) {
			return { error: caughtError.message };
		}
	}
	redirect(303, '/');
});

export const signUp = form(creds.extend({ name: z.string().min(1) }), async (data) => {
	try {
		await auth.api.signUpEmail({ body: data });
	} catch (caughtError) {
		if (caughtError instanceof Error) {
			return { error: caughtError.message };
		}
	}
	redirect(303, '/');
});

export const signOut = form('unchecked', async () => {
	const { request } = getRequestEvent();
	await auth.api.signOut({ headers: request.headers });
	redirect(303, '/login');
});

export const getUser = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) redirect(307, '/login');
	return locals.user;
});

export const signInWithGoogle = form('unchecked', async () => {
	const res = await auth.api.signInSocial({
		body: { provider: 'google', callbackURL: '/' }
	});
	if (!res.url) error(500, 'Could not start Google sign-in');
	redirect(303, res.url, { external: true });
});

export const deleteAccount = form('unchecked', async () => {
	const { locals, request } = getRequestEvent();
	if (!locals.user) error(401, 'Not authenticated');
	await auth.api.deleteUser({ body: {}, headers: request.headers });
	redirect(303, '/login');
});
