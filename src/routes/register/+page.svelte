<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { apiRequest, getToken, setToken } from '$lib/utils/api';

	let username = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let message = '';

	onMount(async () => {
		if (!getToken()) {
			return;
		}

		try {
			const me = await apiRequest('/auth/me');
			if (me.user) {
				goto('/me');
			}
		} catch {
			setToken(null);
		}
	});

	/** @param {unknown} err */
	const getErrorMessage = (err) => (err instanceof Error ? err.message : 'Erreur inconnue');

	const submit = async () => {
		if (password !== confirmPassword) {
			message = 'Les mots de passe ne correspondent pas';
			return;
		}

		loading = true;
		message = '';
		try {
			const result = await apiRequest('/auth/register', {
				method: 'POST',
				body: JSON.stringify({ username, password })
			});
			setToken(result.token);
			goto('/me');
		} catch (error) {
			message = getErrorMessage(error);
		} finally {
			loading = false;
		}
	};
</script>

<main class="auth-screen">
	<section class="auth-card">
		<p class="brand"><i class="fa-solid fa-dumbbell"></i> Muscouns</p>
		<h1><i class="fa-solid fa-user-plus"></i> Créer un compte</h1>
		<p class="hint">Configure ton espace et commence à suivre tes perfs.</p>

		{#if message}
			<p class="error"><i class="fa-solid fa-circle-exclamation"></i> {message}</p>
		{/if}

		<form class="stack" on:submit|preventDefault={submit}>
			<label for="username">Nom utilisateur</label>
			<input id="username" type="text" bind:value={username} minlength="3" required />

			<label for="password">Mot de passe</label>
			<input id="password" type="password" bind:value={password} minlength="6" required />

			<label for="confirm-password">Confirmer le mot de passe</label>
			<input id="confirm-password" type="password" bind:value={confirmPassword} minlength="6" required />

			<button type="submit" disabled={loading}>
				<i class="fa-solid fa-wand-magic-sparkles"></i>
				{loading ? 'Création...' : 'Créer mon compte'}
			</button>
		</form>

		<button class="link" type="button" on:click={() => goto('/login')}>
			<i class="fa-solid fa-right-to-bracket"></i> Déjà inscrit ? Connexion
		</button>
	</section>
</main>

<style>
	.auth-screen {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 1rem;
	}

	.auth-card {
		width: min(100%, 420px);
		border-radius: 1.25rem;
		padding: 1.5rem;
		display: grid;
		gap: 0.85rem;
		border: 1px solid var(--border);
		background: var(--surface-1);
		box-shadow: 0 8px 48px rgba(0, 0, 0, 0.55);
		color: var(--text-1);
	}

	.brand {
		font-weight: 800;
		font-size: 1.1rem;
		color: var(--accent-2);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	h1 {
		font-size: 1.35rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-1);
	}

	.hint {
		color: var(--text-2);
		font-size: 0.88rem;
	}

	.error {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		color: var(--danger);
		background: var(--danger-dim);
		border: 1px solid rgba(255, 92, 138, 0.2);
		border-radius: 0.7rem;
		padding: 0.6rem 0.75rem;
		font-size: 0.88rem;
	}

	.stack {
		display: grid;
		gap: 0.55rem;
	}

	label {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-2);
		margin-bottom: -0.2rem;
	}

	input {
		width: 100%;
		border-radius: 0.75rem;
		padding: 0.72rem 0.85rem;
		border: 1px solid var(--border);
		background: var(--surface-3);
		color: var(--text-1);
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	input:focus {
		outline: none;
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	button {
		width: 100%;
		border: none;
		border-radius: 0.75rem;
		padding: 0.75rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 0.45rem;
		font-weight: 700;
		background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
		color: #fff;
		box-shadow: 0 2px 16px rgba(199, 53, 255, 0.25);
		transition: opacity 0.15s;
	}

	button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	button.link {
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-2);
		box-shadow: none;
	}

	button.link:hover {
		border-color: var(--border-hover);
		color: var(--text-1);
	}
</style>
