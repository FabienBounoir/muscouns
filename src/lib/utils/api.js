const API_BASE = '/_api';

/** @returns {string | null} */
export function getToken() {
	if (typeof localStorage === 'undefined') {
		return null;
	}
	return localStorage.getItem('muscouns.jwt');
}

/** @param {string | null} token */
export function setToken(token) {
	if (typeof localStorage === 'undefined') {
		return;
	}

	if (!token) {
		localStorage.removeItem('muscouns.jwt');
		return;
	}

	localStorage.setItem('muscouns.jwt', token);
}

/** @param {string} endpoint @param {RequestInit=} init */
export async function apiRequest(endpoint, init = {}) {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		...init,
		headers: {
			'content-type': 'application/json',
			...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}),
			...(init.headers || {})
		}
	});

	const contentType = response.headers.get('content-type') || '';
	const body = contentType.includes('application/json')
		? await response.json()
		: { message: await response.text() };

	if (!response.ok) {
		throw new Error(body.message || 'Erreur API');
	}

	return body;
}
