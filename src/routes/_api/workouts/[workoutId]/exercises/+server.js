import { error, json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { createExerciseCollaborative, getExerciseById } from '$lib/server/services/exercise.service';
import { addExerciseToWorkout } from '$lib/server/services/workout.service';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, params }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);

	const { exerciseId, name, target } = await request.json();

	let exercise;
	if (typeof exerciseId === 'string' && exerciseId.trim().length > 0) {
		exercise = await getExerciseById(exerciseId);
		if (!exercise) {
			throw error(404, 'Exercice introuvable');
		}
	} else {
		if (typeof name !== 'string' || name.trim().length < 2) {
			throw error(400, 'Nom exercice invalide');
		}
		exercise = await createExerciseCollaborative(userId, name, typeof target === 'string' ? target : '');
	}

	const entry = await addExerciseToWorkout(userId, params.workoutId, exercise);
	return json({ entry });
}
