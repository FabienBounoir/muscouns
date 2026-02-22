import { json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { removeSetFromExercise } from '$lib/server/services/workout.service';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, params }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);
	await removeSetFromExercise(userId, params.workoutId, params.entryId, params.setId);
	return json({ ok: true });
}
