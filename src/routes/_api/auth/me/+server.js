import { json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { getUserPublicById } from '$lib/server/services/user.service';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);
	const user = await getUserPublicById(userId);

	return json({ user });
}
