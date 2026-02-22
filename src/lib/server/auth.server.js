import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

const jwtSecret = env.JWT_SECRET || env.VITE_JWT_SECRET;

if (!jwtSecret) {
	throw new Error('Missing JWT secret: set JWT_SECRET');
}

/** @param {string} userId */
export function createToken(userId) {
	return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '30d' });
}

/** @param {Request} request */
export function getBearerToken(request) {
	const authorization = request.headers.get('authorization');
	if (!authorization || !authorization.startsWith('Bearer ')) {
		return null;
	}

	return authorization.slice('Bearer '.length).trim();
}

/** @param {string | null} token */
export function requireUserIdFromToken(token) {
	if (!token) {
		throw error(401, 'Token manquant');
	}

	try {
		const decoded = jwt.verify(token, jwtSecret);
		if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
			throw new Error('Token invalide');
		}
		return decoded.sub;
	} catch {
		throw error(401, 'Session invalide');
	}
}
