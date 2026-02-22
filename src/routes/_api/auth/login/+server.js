import { error, json } from '@sveltejs/kit';
import { createToken } from '$lib/server/auth.server';
import { verifyUserCredentials } from '$lib/server/services/user.service';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { username, password } = await request.json();
	if (typeof username !== 'string' || typeof password !== 'string') {
		throw error(400, 'Identifiants invalides');
	}

	const user = await verifyUserCredentials(username, password);
	if (!user) {
		throw error(401, 'Nom utilisateur ou mot de passe incorrect');
	}

	return json({ token: createToken(user._id.toString()) });
}
