import { error, json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { addSetToExercise } from '$lib/server/services/workout.service';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, params }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);

	const { reps, weight } = await request.json();
	const repsValue = Number(reps);
	const weightValue = Number(weight);

	if (!Number.isFinite(repsValue) || repsValue < 1) {
		throw error(400, 'Nombre de répétitions invalide');
	}
	if (!Number.isFinite(weightValue) || weightValue < 0) {
		throw error(400, 'Poids invalide');
	}

	const setItem = await addSetToExercise(
		userId,
		params.workoutId,
		params.entryId,
		repsValue,
		weightValue
	);
	return json({ set: setItem });
}
