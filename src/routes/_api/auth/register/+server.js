import { error, json } from '@sveltejs/kit';
import { createToken } from '$lib/server/auth.server';
import { ensureIndexes } from '$lib/server/db.server';
import { createUser, getUserByUsername } from '$lib/server/services/user.service';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	await ensureIndexes();

	const { username, password } = await request.json();
	if (typeof username !== 'string' || username.trim().length < 3) {
		throw error(400, 'Nom utilisateur invalide (min 3 caractères)');
	}
	if (typeof password !== 'string' || password.length < 6) {
		throw error(400, 'Mot de passe invalide (min 6 caractères)');
	}

	const existing = await getUserByUsername(username);
	if (existing) {
		throw error(409, 'Ce nom utilisateur est déjà pris');
	}

	const userId = await createUser(username, password);
	return json({ token: createToken(userId) });
}
