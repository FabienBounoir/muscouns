import { ObjectId } from 'mongodb';
import { getDb } from '$lib/server/db.server';

/** @param {any} workout */
function toPublicWorkout(workout) {
	return {
		id: workout._id.toString(),
		name: workout.name,
		createdAt: workout.createdAt,
		updatedAt: workout.updatedAt,
		exercises: Array.isArray(workout.exercises) ? workout.exercises : []
	};
}

/** @param {any[]} exercises */
function sanitizeExercises(exercises) {
	if (!Array.isArray(exercises)) {
		return [];
	}

	return exercises.map((exercise) => ({
		id: typeof exercise?.id === 'string' ? exercise.id : crypto.randomUUID(),
		exerciseId: typeof exercise?.exerciseId === 'string' ? exercise.exerciseId : '',
		name: typeof exercise?.name === 'string' ? exercise.name : 'Exercice',
		target: typeof exercise?.target === 'string' ? exercise.target : 'Non précisé',
		sets: Array.isArray(exercise?.sets)
			? exercise.sets.map((/** @type {any} */ setItem) => ({
					id: typeof setItem?.id === 'string' ? setItem.id : crypto.randomUUID(),
					reps: Number.isFinite(Number(setItem?.reps)) ? Number(setItem.reps) : 0,
					weight: Number.isFinite(Number(setItem?.weight)) ? Number(setItem.weight) : 0,
					createdAt:
						typeof setItem?.createdAt === 'string'
							? setItem.createdAt
							: new Date().toISOString()
				}))
			: []
	}));
}

/** @returns {Promise<import('mongodb').Collection>} */
async function workoutsCollection() {
	const db = await getDb();
	return db.collection('workouts');
}

/** @param {string} userId */
export async function listUserWorkouts(userId) {
	const workouts = await workoutsCollection();
	const items = await workouts.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();

	return items.map(toPublicWorkout);
}

/** @param {string} userId @param {string} workoutId */
export async function getUserWorkoutById(userId, workoutId) {
	const workouts = await workoutsCollection();
	const item = await workouts.findOne({ _id: new ObjectId(workoutId), userId: new ObjectId(userId) });
	if (!item) {
		return null;
	}

	return toPublicWorkout(item);
}

/** @param {string} userId @param {string} name */
export async function createWorkout(userId, name) {
	const workouts = await workoutsCollection();
	const now = new Date().toISOString();

	const result = await workouts.insertOne({
		userId: new ObjectId(userId),
		name: name.trim(),
		createdAt: now,
		updatedAt: now,
		exercises: []
	});

	return {
		id: result.insertedId.toString(),
		name: name.trim(),
		createdAt: now,
		updatedAt: now,
		exercises: []
	};
}

/**
 * @param {string} userId
 * @param {string} workoutId
 * @param {{ name?: string; exercises?: any[] }} payload
 */
export async function updateWorkout(userId, workoutId, payload) {
	const workouts = await workoutsCollection();
	/** @type {{ updatedAt: string; name?: string; exercises?: any[] }} */
	const updatePayload = {
		updatedAt: new Date().toISOString()
	};

	if (typeof payload.name === 'string') {
		updatePayload.name = payload.name.trim() || 'Sans nom';
	}

	if (payload.exercises !== undefined) {
		updatePayload.exercises = sanitizeExercises(payload.exercises);
	}

	await workouts.updateOne(
		{ _id: new ObjectId(workoutId), userId: new ObjectId(userId) },
		{ $set: updatePayload }
	);

	return getUserWorkoutById(userId, workoutId);
}

/** @param {string} userId @param {string} workoutId */
export async function deleteWorkout(userId, workoutId) {
	const workouts = await workoutsCollection();
	await workouts.deleteOne({ _id: new ObjectId(workoutId), userId: new ObjectId(userId) });
}

/** @param {string} userId @param {string} workoutId @param {{ id: string; name: string; target: string }} exercise */
export async function addExerciseToWorkout(userId, workoutId, exercise) {
	const workouts = await workoutsCollection();
	const entry = {
		id: crypto.randomUUID(),
		exerciseId: exercise.id,
		name: exercise.name,
		target: exercise.target,
		sets: []
	};

	await workouts.updateOne(
		{ _id: new ObjectId(workoutId), userId: new ObjectId(userId) },
		{ $push: { exercises: entry } }
	);

	return entry;
}

/** @param {string} userId @param {string} workoutId @param {string} entryId */
export async function removeExerciseFromWorkout(userId, workoutId, entryId) {
	const workouts = await workoutsCollection();
	await workouts.updateOne(
		{ _id: new ObjectId(workoutId), userId: new ObjectId(userId) },
		{ $pull: { exercises: { id: entryId } } }
	);
}

/** @param {string} userId @param {string} workoutId @param {string} entryId @param {number} reps @param {number} weight */
export async function addSetToExercise(userId, workoutId, entryId, reps, weight) {
	const workouts = await workoutsCollection();
	const setItem = {
		id: crypto.randomUUID(),
		reps,
		weight,
		createdAt: new Date().toISOString()
	};

	await workouts.updateOne(
		{ _id: new ObjectId(workoutId), userId: new ObjectId(userId), 'exercises.id': entryId },
		{ $push: { 'exercises.$.sets': setItem } }
	);

	return setItem;
}

/** @param {string} userId @param {string} workoutId @param {string} entryId @param {string} setId */
export async function removeSetFromExercise(userId, workoutId, entryId, setId) {
	const workouts = await workoutsCollection();
	const workoutObjectId = new ObjectId(workoutId);
	const userObjectId = new ObjectId(userId);

	const workout = await workouts.findOne({ _id: workoutObjectId, userId: userObjectId });
	if (!workout || !Array.isArray(workout.exercises)) {
		return;
	}

	const nextExercises = workout.exercises.map((exercise) => {
		if (exercise.id !== entryId || !Array.isArray(exercise.sets)) {
			return exercise;
		}

		return {
			...exercise,
			sets: exercise.sets.filter((/** @type {{ id: string }} */ setItem) => setItem.id !== setId)
		};
	});

	await workouts.updateOne(
		{ _id: workoutObjectId, userId: userObjectId },
		{ $set: { exercises: nextExercises } }
	);
}
