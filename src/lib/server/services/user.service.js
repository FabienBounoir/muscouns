import { ObjectId } from 'mongodb';
import { getDb } from '$lib/server/db.server';
import { crypter } from '$lib/utils/crypter';

/** @param {string} username */
export function normalizeUsername(username) {
	return username.trim().toLowerCase();
}

/** @returns {Promise<import('mongodb').Collection>} */
async function usersCollection() {
	const db = await getDb();
	return db.collection('users');
}

/** @param {string} username */
export async function getUserByUsername(username) {
	const users = await usersCollection();
	return users.findOne({ usernameLower: normalizeUsername(username) });
}

/** @param {string} userId */
export async function getUserPublicById(userId) {
	const users = await usersCollection();
	const user = await users.findOne({ _id: new ObjectId(userId) });
	if (!user) {
		return null;
	}

	return {
		id: user._id.toString(),
		username: user.username,
		createdAt: user.createdAt
	};
}

/** @param {string} username @param {string} password */
export async function createUser(username, password) {
	const users = await usersCollection();
	const now = new Date().toISOString();

	const result = await users.insertOne({
		username: username.trim(),
		usernameLower: normalizeUsername(username),
		passwordHash: await crypter.hash(password),
		createdAt: now
	});

	return result.insertedId.toString();
}

/** @param {string} username @param {string} password */
export async function verifyUserCredentials(username, password) {
	const user = await getUserByUsername(username);
	if (!user) {
		return null;
	}

	const isValid = await crypter.verify(password, user.passwordHash);
	return isValid ? user : null;
}
