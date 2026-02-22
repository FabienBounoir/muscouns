import { json } from '@sveltejs/kit';
import { getBearerToken, requireUserIdFromToken } from '$lib/server/auth.server';
import { deleteWorkout, getUserWorkoutById, updateWorkout } from '$lib/server/services/workout.service';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);
	const workout = await getUserWorkoutById(userId, params.workoutId);
	return json({ workout });
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, params }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);
	const payload = await request.json();
	const workout = await updateWorkout(userId, params.workoutId, payload);
	return json({ workout });
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, params }) {
	const token = getBearerToken(request);
	const userId = requireUserIdFromToken(token);
	await deleteWorkout(userId, params.workoutId);
	return json({ ok: true });
}
