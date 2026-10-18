import { createHmac } from 'node:crypto';
import { error, redirect } from '@sveltejs/kit';
import { BETTER_AUTH_SECRET, TURN_URL, TURN_SECRET } from '$app/env/private';
import { rooms } from '#lib/server/rooms.ts';

export const load = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');

	const code = params.code.toUpperCase();
	if (!(await rooms.findOne({ _id: code }))) error(404, 'Room not found');

	const roomKey = createHmac('sha256', BETTER_AUTH_SECRET).update(code).digest('hex');

	const iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

	if (TURN_URL && TURN_SECRET) {
		// coturn's "username" is an expiry timestamp plus any label; the password is an HMAC of it
		const username = `${Math.floor(Date.now() / 1000) + 24 * 3600}:${locals.user.id}`;
		const credential = createHmac('sha1', TURN_SECRET).update(username).digest('base64');

		iceServers.push({ urls: TURN_URL.split(','), username, credential });
	}

	return { code, roomKey, iceServers, me: { id: locals.user.id, name: locals.user.name } };
};
