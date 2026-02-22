import { ObjectId } from 'mongodb';
import { getDb } from '$lib/server/db.server';

/** @returns {Promise<import('mongodb').Collection>} */
async function exercisesCollection() {
	const db = await getDb();
	return db.collection('exercises');
}

/** @param {string} name */
function normalizeExerciseName(name) {
	return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** @param {string} search */
export async function listExercises(search = '') {
	const exercises = await exercisesCollection();
	const cleanedSearch = search.trim();

	const query = cleanedSearch
		? {
				name: {
					$regex: cleanedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
					$options: 'i'
				}
			}
		: {};

	const items = await exercises.find(query).sort({ name: 1 }).limit(100).toArray();
	return items.map((item) => ({
		id: item._id.toString(),
		name: item.name,
		target: item.target,
		createdAt: item.createdAt,
		createdBy: item.createdBy
	}));
}

/** @param {string} userId @param {string} name @param {string} target */
export async function createExerciseCollaborative(userId, name, target) {
	const exercises = await exercisesCollection();
	const normalizedName = normalizeExerciseName(name);
	const now = new Date().toISOString();

	const existing = await exercises.findOne({ normalizedName });
	if (existing) {
		return {
			id: existing._id.toString(),
			name: existing.name,
			target: existing.target
		};
	}

	const result = await exercises.insertOne({
		name: name.trim(),
		normalizedName,
		target: target.trim() || 'Non précisé',
		createdAt: now,
		createdBy: new ObjectId(userId)
	});

	return {
		id: result.insertedId.toString(),
		name: name.trim(),
		target: target.trim() || 'Non précisé'
	};
}

/** @param {string} exerciseId */
export async function getExerciseById(exerciseId) {
	const exercises = await exercisesCollection();
	const exercise = await exercises.findOne({ _id: new ObjectId(exerciseId) });
	if (!exercise) {
		return null;
	}

	return {
		id: exercise._id.toString(),
		name: exercise.name,
		target: exercise.target
	};
}
