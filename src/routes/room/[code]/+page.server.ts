import { createHmac } from 'node:crypto';
import { error, redirect } from '@sveltejs/kit';
import { BETTER_AUTH_SECRET } from '$app/env/private';
import { rooms } from '#lib/server/rooms.ts';

export const load = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');

	const code = params.code.toUpperCase();
	if (!(await rooms.findOne({ _id: code }))) error(404, 'Room not found');

	const roomKey = createHmac('sha256', BETTER_AUTH_SECRET).update(code).digest('hex');

	return { code, roomKey, me: { id: locals.user.id, name: locals.user.name } };
};
