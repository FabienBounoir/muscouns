<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiRequest, getToken, setToken } from '$lib/utils/api';

	let loading = true;
	let message = '';
	let creating = false;
	let showCreateView = false;
	let workoutName = '';
	/** @type {{ id: string; username: string } | null} */
	let user = null;
	/** @type {Array<{ id: string; name: string; createdAt: string; exercises: any[], updatedAt: string }>} */
	let workouts = [];

	/** @param {unknown} err */
	const getErrorMessage = (err) => (err instanceof Error ? err.message : 'Erreur inconnue');

	const loadWorkouts = async () => {
		const result = await apiRequest('/workouts');
		workouts = result.workouts;
	};

	onMount(async () => {
		if (!getToken()) {
			goto('/login');
			return;
		}

		try {
			const me = await apiRequest('/auth/me');
			if (!me.user) {
				setToken(null);
				goto('/login');
				return;
			}
			user = me.user;
			await loadWorkouts();
		} catch {
			setToken(null);
			goto('/login');
		} finally {
			loading = false;
		}
	});

	const logout = () => {
		setToken(null);
		goto('/login');
	};

	const createWorkout = async () => {
		if (!workoutName.trim()) {
			return;
		}

		creating = true;
		message = '';
		try {
			await apiRequest('/workouts', {
				method: 'POST',
				body: JSON.stringify({ name: workoutName })
			});
			workoutName = '';
			showCreateView = false;
			await loadWorkouts();
		} catch (error) {
			message = getErrorMessage(error);
		} finally {
			creating = false;
		}
	};
</script>

<main class="app">
	<header class="panel topbar">
		<div>
			<p class="logo"><i class="fa-solid fa-user"></i> Mon espace</p>
			{#if user}<p class="username">@{user.username}</p>{/if}
		</div>
		<div class="topbar-actions">
			<a href="/" class="icon-btn" aria-label="Landing" title="Landing">
				<i class="fa-solid fa-house"></i>
			</a>
			<button class="ghost" type="button" on:click={logout}>
				<i class="fa-solid fa-right-from-bracket"></i> Déconnexion
			</button>
		</div>
	</header>

	<button class="create-trigger" type="button" on:click={() => (showCreateView = true)}>
		<i class="fa-solid fa-plus"></i> Créer un entraînement
	</button>

	{#if message}
		<p class="state"><i class="fa-solid fa-triangle-exclamation"></i> {message}</p>
	{/if}

	{#if loading}
		<section class="list">
			{#each Array(4) as _}
				<div class="panel card skeleton-card">
					<div class="skeleton sk-title"></div>
					<div class="skeleton sk-subtitle"></div>
					<div class="skeleton sk-go"></div>
				</div>
			{/each}
		</section>
	{:else if workouts.length === 0}
		<p class="state"><i class="fa-regular fa-folder-open"></i> Aucun entraînement</p>
	{:else}
		<section class="list">
			{#each workouts as workout}
				<a class="panel card" href={`/workout/${workout.id}`}>
					<h2><i class="fa-solid fa-calendar-check"></i> {workout.name}</h2>
					<p class="subtitle">
						{new Date(workout.updatedAt).toLocaleDateString('fr-FR')} · {workout.exercises?.length || 0}
						exercice(s)
					</p>
					<span class="go">Ouvrir <i class="fa-solid fa-arrow-right"></i></span>
				</a>
			{/each}
		</section>
	{/if}

	{#if showCreateView}
		<section class="create-overlay" aria-modal="true" role="dialog">
			<div class="create-panel">
				<header class="create-head">
					<h2><i class="fa-solid fa-bolt"></i> Nouveau workout</h2>
					<button class="ghost" type="button" on:click={() => (showCreateView = false)}>
						<i class="fa-solid fa-xmark"></i>
					</button>
				</header>

				<form class="stack" on:submit|preventDefault={createWorkout}>
					<label for="workout-name">Nom</label>
					<input
						id="workout-name"
						type="text"
						bind:value={workoutName}
						placeholder="Ex: Push - Pecs / Triceps"
						required
					/>
					<button type="submit" disabled={creating}>
						<i class="fa-solid fa-plus"></i>
						{creating ? 'Création...' : 'Créer'}
					</button>
				</form>
			</div>
		</section>
	{/if}
</main>

<style>
	.app {
		max-width: 840px;
		margin: 0 auto;
		padding: 1rem;
		display: grid;
		gap: 0.9rem;
	}

	.panel {
		border: 1px solid var(--border);
		background: var(--surface-1);
		border-radius: 1rem;
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
		color: var(--text-1);
	}

	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
	}

	.topbar-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.logo {
		font-size: 1.05rem;
		font-weight: 800;
		color: var(--text-1);
	}

	.username {
		font-size: 0.82rem;
		color: var(--text-2);
		margin-top: 0.1rem;
	}

	input {
		width: 100%;
		border-radius: 0.75rem;
		border: 1px solid var(--border);
		background: var(--surface-3);
		color: var(--text-1);
		padding: 0.72rem 0.85rem;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	input:focus {
		outline: none;
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	button {
		width: 100%;
		border-radius: 0.75rem;
		padding: 0.72rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		border: none;
		font-weight: 700;
		background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
		color: #fff;
		box-shadow: 0 2px 16px rgba(199, 53, 255, 0.22);
		transition: opacity 0.15s;
	}

	button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	button.ghost {
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-2);
		box-shadow: none;
		width: auto;
	}

	button.ghost:hover {
		border-color: var(--border-hover);
		color: var(--text-1);
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		width: fit-content;
		padding: 0.55rem 0.75rem;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-1);
		border-radius: 0.75rem;
		font-weight: 700;
		font-size: 0.88rem;
		transition: border-color 0.15s;
	}

	.icon-btn:hover {
		border-color: var(--border-hover);
	}

	.stack {
		display: grid;
		gap: 0.45rem;
	}

	label {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-2);
	}

	.state {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.92rem;
		color: var(--text-2);
		padding: 0.2rem 0.1rem;
	}

	.list {
		display: grid;
		gap: 0.65rem;
	}

	/* ─── Skeleton ─── */
	@keyframes shimmer {
		0%   { background-position: -600px 0; }
		100% { background-position: 600px 0; }
	}

	.skeleton {
		border-radius: 0.5rem;
		background: linear-gradient(
			90deg,
			rgba(164, 0, 240, 0.18) 25%,
			rgba(199, 53, 255, 0.38) 50%,
			rgba(164, 0, 240, 0.18) 75%
		);
		background-size: 1200px 100%;
		animation: shimmer 1.4s ease-in-out infinite;
	}

	.skeleton-card {
		pointer-events: none;
	}

	.sk-title {
		height: 1rem;
		width: 55%;
	}

	.sk-subtitle {
		height: 0.78rem;
		width: 38%;
	}

	.sk-go {
		height: 0.78rem;
		width: 18%;
	}

	.card {
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.card:visited {
		color: inherit;
	}

	.card:hover {
		border-color: var(--border-hover);
		box-shadow: 0 6px 32px rgba(0, 0, 0, 0.5);
	}

	h2 {
		font-size: 0.98rem;
		font-weight: 700;
		color: var(--text-1);
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.subtitle {
		font-size: 0.82rem;
		color: var(--text-2);
	}

	.go {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--accent-2);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.create-trigger {
		width: 100%;
	}

	.create-overlay {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(5, 0, 12, 0.75);
		backdrop-filter: blur(6px);
	}

	.create-panel {
		width: min(100%, 520px);
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		padding: 1.2rem;
		display: grid;
		gap: 0.85rem;
		background: var(--surface-1);
		box-shadow: 0 12px 56px rgba(0, 0, 0, 0.65);
		color: var(--text-1);
	}

	.create-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
	}

	.create-head h2 {
		font-size: 1.05rem;
	}

	.create-head button.ghost {
		width: auto;
		padding: 0.45rem 0.6rem;
	}

	@media (max-width: 720px) {
		.topbar {
			flex-direction: column;
			align-items: stretch;
		}

		.topbar-actions {
			justify-content: space-between;
		}
	}
</style>
