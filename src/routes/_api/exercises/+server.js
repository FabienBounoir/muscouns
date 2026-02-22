import { error, json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { ensureIndexes } from '$lib/server/db.server';
import { createExerciseCollaborative, listExercises } from '$lib/server/services/exercise.service';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	await ensureIndexes();
	const search = url.searchParams.get('search') || '';
	const exercises = await listExercises(search);
	return json({ exercises });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	await ensureIndexes();
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);

	const { name, target } = await request.json();
	if (typeof name !== 'string' || name.trim().length < 2) {
		throw error(400, 'Nom exercice invalide');
	}
	if (target !== undefined && typeof target !== 'string') {
		throw error(400, 'Muscle cible invalide');
	}

	const exercise = await createExerciseCollaborative(userId, name, target || '');
	return json({ exercise });
}
