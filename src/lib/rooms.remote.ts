import { form, getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { rooms } from '#lib/server/rooms.ts';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

function makeCode() {
	const bytes = crypto.getRandomValues(new Uint8Array(6));
	return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

function requireUser() {
	const { locals } = getRequestEvent();
	if (!locals.user) error(401, 'Not signed in');
	return locals.user;
}

export const createRoom = form(z.object({}), async () => {
	const user = requireUser();
	let code = '';
	for (let i = 0; i < 5 && !code; i++) {
		const candidate = makeCode();
		try {
			await rooms.insertOne({ _id: candidate, ownerId: user.id, createdAt: new Date() });
			code = candidate;
		} catch (e: any) {
			if (e?.code !== 11000) throw e; // 11000 = duplicate key, retry
		}
	}
	if (!code) error(500, 'Could not create room');
	redirect(303, `/room/${code}`);
});

export const joinRoom = form(
	z.object({ code: z.string().trim().toUpperCase().length(6) }),
	async ({ code }) => {
		requireUser();
		if (!(await rooms.findOne({ _id: code }))) return { error: 'Room not found' };
		redirect(303, `/room/${code}`);
	}
);
