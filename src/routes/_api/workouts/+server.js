import { error, json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { ensureIndexes } from '$lib/server/db.server';
import { createWorkout, listUserWorkouts } from '$lib/server/services/workout.service';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
	await ensureIndexes();
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);
	const workouts = await listUserWorkouts(userId);
	return json({ workouts });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	await ensureIndexes();
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);

	const { name } = await request.json();
	if (typeof name !== 'string' || name.trim().length < 2) {
		throw error(400, 'Nom entraînement invalide');
	}

	const workout = await createWorkout(userId, name);
	return json({ workout });
}
