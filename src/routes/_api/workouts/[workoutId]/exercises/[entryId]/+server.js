import { json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { removeExerciseFromWorkout } from '$lib/server/services/workout.service';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, params }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);
	await removeExerciseFromWorkout(userId, params.workoutId, params.entryId);
	return json({ ok: true });
}
