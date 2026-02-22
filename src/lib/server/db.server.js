import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

const mongoUri = env.MONGO_DB_URI || env.VITE_MONGO_DB_URI;
const mongoDbName = env.MONGO_DB_NAME || env.VITE_MONGO_DB_NAME;

if (!mongoUri || !mongoDbName) {
	throw new Error('Missing MongoDB config: set MONGO_DB_URI and MONGO_DB_NAME');
}

const client = new MongoClient(mongoUri);
const connection = client.connect();

/** @returns {Promise<import('mongodb').Db>} */
export async function getDb() {
	await connection;
	return client.db(mongoDbName);
}

let indexesReady = false;

export async function ensureIndexes() {
	if (indexesReady) {
		return;
	}

	const db = await getDb();
	await Promise.all([
		db.collection('users').createIndex({ usernameLower: 1 }, { unique: true }),
		db.collection('exercises').createIndex({ normalizedName: 1 }, { unique: true }),
		db.collection('workouts').createIndex({ userId: 1, createdAt: -1 })
	]);

	indexesReady = true;
}
