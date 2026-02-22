import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'muscouns.workouts.v1';

/** @returns {Workout[]} */
function getInitialWorkouts() {
	if (!browser) {
		return [];
	}

	const rawValue = localStorage.getItem(STORAGE_KEY);
	if (!rawValue) {
		return [];
	}

	try {
		const parsed = JSON.parse(rawValue);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

/** @param {Workout[]} workouts */
function persist(workouts) {
	if (!browser) {
		return;
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function createWorkoutsStore() {
	const { subscribe, update, set } = writable(getInitialWorkouts());

	if (browser) {
		subscribe((value) => persist(value));
	}

	/** @param {string} name */
	function addWorkout(name) {
		const cleanedName = name.trim();
		if (!cleanedName) {
			return;
		}

		update((workouts) => [
			{
				id: crypto.randomUUID(),
				name: cleanedName,
				createdAt: new Date().toISOString(),
				exercises: []
			},
			...workouts
		]);
	}

	/** @param {string} workoutId */
	function deleteWorkout(workoutId) {
		update((workouts) => workouts.filter((workout) => workout.id !== workoutId));
	}

	/** @param {string} workoutId @param {string} exerciseName @param {string} target */
	function addExercise(workoutId, exerciseName, target) {
		const cleanedName = exerciseName.trim();
		if (!cleanedName) {
			return;
		}

		update((workouts) =>
			workouts.map((workout) => {
				if (workout.id !== workoutId) {
					return workout;
				}

				return {
					...workout,
					exercises: [
						...workout.exercises,
						{
							id: crypto.randomUUID(),
							name: cleanedName,
							target: target.trim() || 'Non précisé',
							sets: []
						}
					]
				};
			})
		);
	}

	/** @param {string} workoutId @param {string} exerciseId */
	function deleteExercise(workoutId, exerciseId) {
		update((workouts) =>
			workouts.map((workout) => {
				if (workout.id !== workoutId) {
					return workout;
				}

				return {
					...workout,
					exercises: workout.exercises.filter((exercise) => exercise.id !== exerciseId)
				};
			})
		);
	}

	/** @param {string} workoutId @param {string} exerciseId @param {number} reps @param {number} weight */
	function addSet(workoutId, exerciseId, reps, weight) {
		if (!Number.isFinite(reps) || !Number.isFinite(weight)) {
			return;
		}

		update((workouts) =>
			workouts.map((workout) => {
				if (workout.id !== workoutId) {
					return workout;
				}

				return {
					...workout,
					exercises: workout.exercises.map((exercise) => {
						if (exercise.id !== exerciseId) {
							return exercise;
						}

						return {
							...exercise,
							sets: [
								...exercise.sets,
								{
									id: crypto.randomUUID(),
									reps,
									weight,
									createdAt: new Date().toISOString()
								}
							]
						};
					})
				};
			})
		);
	}

	/** @param {string} workoutId @param {string} exerciseId @param {string} setId */
	function deleteSet(workoutId, exerciseId, setId) {
		update((workouts) =>
			workouts.map((workout) => {
				if (workout.id !== workoutId) {
					return workout;
				}

				return {
					...workout,
					exercises: workout.exercises.map((exercise) => {
						if (exercise.id !== exerciseId) {
							return exercise;
						}

						return {
							...exercise,
							sets: exercise.sets.filter((setItem) => setItem.id !== setId)
						};
					})
				};
			})
		);
	}

	function clear() {
		set([]);
	}

	return {
		subscribe,
		addWorkout,
		deleteWorkout,
		addExercise,
		deleteExercise,
		addSet,
		deleteSet,
		clear
	};
}

export const workouts = createWorkoutsStore();

/**
 * @typedef {{
 *  id: string;
 *  reps: number;
 *  weight: number;
 *  createdAt: string;
 * }} WorkoutSet
 */

/**
 * @typedef {{
 *  id: string;
 *  name: string;
 *  target: string;
 *  sets: WorkoutSet[];
 * }} Exercise
 */

/**
 * @typedef {{
 *  id: string;
 *  name: string;
 *  createdAt: string;
 *  exercises: Exercise[];
 * }} Workout
 */
