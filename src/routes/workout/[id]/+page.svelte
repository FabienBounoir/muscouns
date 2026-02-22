<script>
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ExercisePickerModal from '$lib/components/workout/ExercisePickerModal.svelte';
	import WorkoutExerciseCard from '$lib/components/workout/WorkoutExerciseCard.svelte';
	import { apiRequest, getToken, setToken } from '$lib/utils/api';

	let loading = true;
	let message = '';
	let saving = false;
	let autosaveStatus = '';

	/** @type {{ id: string; name: string; exercises: any[] } | null} */
	let workout = null;
	let workoutId = '';

	let showExerciseModal = false;
	let search = '';
	let searching = false;
	/** @type {Array<{ id: string; name: string; target: string }>} */
	let searchResults = [];
	let createName = '';
	let createTarget = '';

	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let searchTimer;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let autosaveTimer;
	let autosavePending = false;
	let lastSavedSnapshot = '';

	const AUTOSAVE_DELAY_MS = 900;

	/** @param {unknown} err */
	const getErrorMessage = (err) => (err instanceof Error ? err.message : 'Erreur inconnue');

	/** @param {{ name: string; exercises: any[] } | null} value */
	const snapshotWorkout = (value) => JSON.stringify({ name: value?.name || '', exercises: value?.exercises || [] });

	const loadWorkout = async () => {
		const result = await apiRequest(`/workouts/${workoutId}`);
		if (!result.workout) {
			goto('/me');
			return;
		}
		workout = result.workout;
		lastSavedSnapshot = snapshotWorkout(workout);
		autosaveStatus = '';
	};

	const saveWorkout = async () => {
		if (!workout) {
			return;
		}

		const currentSnapshot = snapshotWorkout(workout);
		if (currentSnapshot === lastSavedSnapshot) {
			autosaveStatus = 'À jour';
			return;
		}

		if (saving) {
			autosavePending = true;
			return;
		}

		saving = true;
		autosaveStatus = 'Sauvegarde...';
		try {
			const result = await apiRequest(`/workouts/${workoutId}`, {
				method: 'PUT',
				body: JSON.stringify({
					name: workout.name,
					exercises: workout.exercises
				})
			});
			workout = result.workout;
			lastSavedSnapshot = snapshotWorkout(workout);
			autosaveStatus = 'Sauvegardé';
		} catch (error) {
			message = getErrorMessage(error);
			autosaveStatus = 'Erreur de sauvegarde';
		} finally {
			saving = false;
			if (autosavePending) {
				autosavePending = false;
				scheduleAutosave();
			}
		}
	};

	const scheduleAutosave = () => {
		autosavePending = true;
		autosaveStatus = 'Modifications...';
		clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(async () => {
			autosavePending = false;
			await saveWorkout();
		}, AUTOSAVE_DELAY_MS);
	};

	onDestroy(() => {
		clearTimeout(searchTimer);
		clearTimeout(autosaveTimer);
	});

	/** @param {number} exerciseIndex */
	const addSet = (exerciseIndex) => {
		if (!workout) {
			return;
		}

		const nextExercises = workout.exercises.map((exercise, index) => {
			if (index !== exerciseIndex) {
				return exercise;
			}

			return {
				...exercise,
				sets: [
					...(exercise.sets || []),
					{
						id: crypto.randomUUID(),
						reps: 10,
						weight: 0,
						createdAt: new Date().toISOString()
					}
				]
			};
		});

		workout = { ...workout, exercises: nextExercises };
		scheduleAutosave();
	};

	/** @param {number} exerciseIndex @param {number} setIndex */
	const removeSet = (exerciseIndex, setIndex) => {
		if (!workout) {
			return;
		}

		const nextExercises = workout.exercises.map((exercise, index) => {
			if (index !== exerciseIndex) {
				return exercise;
			}

			return {
				...exercise,
				sets: (exercise.sets || []).filter((/** @type {any} */ _, /** @type {number} */ indexSet) => indexSet !== setIndex)
			};
		});

		workout = { ...workout, exercises: nextExercises };
		scheduleAutosave();
	};

	/** @param {number} exerciseIndex @param {number} setIndex @param {'reps'|'weight'} field @param {string} value */
	const updateSetField = (exerciseIndex, setIndex, field, value) => {
		if (!workout) {
			return;
		}

		const parsed = Number(value);
		const safeValue = Number.isFinite(parsed) ? parsed : 0;
		const nextExercises = workout.exercises.map((exercise, index) => {
			if (index !== exerciseIndex) {
				return exercise;
			}

			return {
				...exercise,
				sets: (exercise.sets || []).map((/** @type {any} */ setItem, /** @type {number} */ indexSet) =>
					indexSet === setIndex ? { ...setItem, [field]: safeValue } : setItem
				)
			};
		});

		workout = { ...workout, exercises: nextExercises };
		scheduleAutosave();
	};

	/** @param {number} exerciseIndex */
	const removeExercise = (exerciseIndex) => {
		if (!workout) {
			return;
		}

		const exercise = workout.exercises[exerciseIndex];
		const hasSets = Array.isArray(exercise?.sets) && exercise.sets.length > 0;

		if (hasSets) {
			const confirmed = confirm('Cet exercice contient des séries. Confirmer la suppression ?');
			if (!confirmed) {
				return;
			}
		}

		workout = {
			...workout,
			exercises: workout.exercises.filter((_, index) => index !== exerciseIndex)
		};
		scheduleAutosave();
	};

	/** @param {string} query */
	const searchExercises = async (query) => {
		searching = true;
		try {
			const result = await apiRequest(`/exercises?search=${encodeURIComponent(query)}`);
			searchResults = result.exercises;
		} catch (error) {
			message = getErrorMessage(error);
		} finally {
			searching = false;
		}
	};

	/** @param {string} value */
	const onSearchInput = (value) => {
		search = value;
		createName = value;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => searchExercises(value), 250);
	};

	const openExerciseModal = async () => {
		showExerciseModal = true;
		search = '';
		createName = '';
		createTarget = '';
		await searchExercises('');
	};

	const closeExerciseModal = () => {
		showExerciseModal = false;
	};

	/** @param {{ id: string; name: string; target: string }} exercise */
	const addExerciseFromLibrary = (exercise) => {
		if (!workout) {
			return;
		}

		workout = {
			...workout,
			exercises: [
				...workout.exercises,
				{
					id: crypto.randomUUID(),
					exerciseId: exercise.id,
					name: exercise.name,
					target: exercise.target,
					sets: []
				}
			]
		};
		closeExerciseModal();
		scheduleAutosave();
	};

	const createAndAddExercise = async () => {
		if (!createName.trim()) {
			message = 'Nom exercice requis';
			return;
		}

		try {
			const result = await apiRequest('/exercises', {
				method: 'POST',
				body: JSON.stringify({ name: createName, target: createTarget })
			});
			addExerciseFromLibrary(result.exercise);
		} catch (error) {
			message = getErrorMessage(error);
		}
	};

	onMount(async () => {
		if (!getToken()) {
			goto('/login');
			return;
		}

		workoutId = $page.params.id || '';
		if (!workoutId) {
			goto('/me');
			return;
		}
		try {
			const me = await apiRequest('/auth/me');
			if (!me.user) {
				setToken(null);
				goto('/login');
				return;
			}
			await loadWorkout();
		} catch {
			setToken(null);
			goto('/login');
		} finally {
			loading = false;
		}
	});

</script>

<main class="app">
	<header class="panel topbar">
		<a href="/me" class="icon-btn back-btn" aria-label="Retour" title="Retour">
				<i class="fa-solid fa-arrow-left"></i>
				<span>Retour</span>
		</a>

		<div class="header-actions">
			<span class="icon-btn status-btn" title={autosaveStatus || 'Autosave actif'}>
				{#if saving}
					<i class="fa-solid fa-spinner fa-spin"></i>
				{:else}
					<i class="fa-solid fa-cloud-arrow-up"></i>
				{/if}
			</span>
		</div>
	</header>

	{#if message}
		<p class="message"><i class="fa-solid fa-triangle-exclamation"></i> {message}</p>
	{/if}

	{#if loading || !workout}
		<section class="workout-title-section">
			<div class="skeleton sk-workout-title"></div>
		</section>
		<section class="list">
			{#each Array(2) as _}
				<div class="panel skeleton-exercise">
					<div class="skeleton sk-ex-name"></div>
					<div class="sk-sets">
						{#each Array(3) as _}
							<div class="skeleton sk-set-row"></div>
						{/each}
					</div>
				</div>
			{/each}
		</section>
	{:else}
		<section class="workout-title-section">
			<h1 class="workout-name-value">{workout.name}</h1>
		</section>

		<section class="list">
			{#if workout.exercises.length === 0}
				<p class="state"><i class="fa-regular fa-folder-open"></i> Aucun exercice dans cet entraînement.</p>
			{:else}
				{#each workout.exercises as exercise, exerciseIndex}
					<WorkoutExerciseCard
						{exercise}
						{exerciseIndex}
						on:removeExercise={(event) => removeExercise(event.detail.exerciseIndex)}
						on:addSet={(event) => addSet(event.detail.exerciseIndex)}
						on:removeSet={(event) => removeSet(event.detail.exerciseIndex, event.detail.setIndex)}
						on:updateSetField={(event) =>
							updateSetField(
								event.detail.exerciseIndex,
								event.detail.setIndex,
								event.detail.field,
								event.detail.value
							)}
					/>
				{/each}
			{/if}
		</section>

		<div class="bottom-action">
			<button type="button" on:click={openExerciseModal}>
				<i class="fa-solid fa-plus"></i> Ajouter un exercice
			</button>
		</div>
	{/if}

	<ExercisePickerModal
		open={showExerciseModal}
		search={search}
		searching={searching}
		searchResults={searchResults}
		createName={createName}
		createTarget={createTarget}
		on:close={closeExerciseModal}
		on:searchInput={(event) => onSearchInput(event.detail.value)}
		on:addExercise={(event) => addExerciseFromLibrary(event.detail.exercise)}
		on:createNameInput={(event) => (createName = event.detail.value)}
		on:createTargetInput={(event) => (createTarget = event.detail.value)}
		on:createAndAdd={createAndAddExercise}
	/>
</main>

<style>
	.app {
		max-width: 860px;
		margin: 0 auto;
		padding: 1rem 1rem 6rem;
		display: grid;
		gap: 0.9rem;
	}

	.panel {
		border: 1px solid var(--border);
		background: var(--surface-1);
		border-radius: 1rem;
		padding: 1rem;
		display: grid;
		gap: 0.65rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
		color: var(--text-1);
	}

	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		border: 1px solid var(--border);
		border-radius: 0.7rem;
		background: var(--surface-2);
		color: var(--text-2);
		text-decoration: none;
		transition: border-color 0.15s, color 0.15s;
	}

	.icon-btn:hover {
		border-color: var(--border-hover);
		color: var(--text-1);
	}

	.back-btn {
		width: auto;
		padding: 0 0.7rem;
		gap: 0.4rem;
		font-weight: 700;
		font-size: 0.88rem;
		color: var(--text-1);
	}

	.status-btn {
		color: var(--text-3);
	}

	.workout-title-section {
		padding: 0.15rem 0.1rem;
	}

	.workout-name-value {
		font-size: clamp(1.6rem, 4.6vw, 2.25rem);
		line-height: 1.1;
		font-weight: 800;
		letter-spacing: -0.025em;
		color: var(--text-1);
	}

	button {
		width: 100%;
		border-radius: 0.75rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font-weight: 700;
		border: none;
		padding: 0.75rem;
		background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
		color: #fff;
		box-shadow: 0 2px 16px rgba(199, 53, 255, 0.22);
		transition: opacity 0.15s;
	}

	button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.message {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.88rem;
		color: var(--danger);
		background: var(--danger-dim);
		border: 1px solid rgba(255, 92, 138, 0.2);
		border-radius: 0.7rem;
		padding: 0.6rem 0.75rem;
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
		gap: 0.75rem;
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

	.sk-workout-title {
		height: clamp(1.9rem, 4.6vw, 2.4rem);
		width: 52%;
		border-radius: 0.6rem;
	}

	.skeleton-exercise {
		pointer-events: none;
		display: grid;
		gap: 0.65rem;
	}

	.sk-ex-name {
		height: 1rem;
		width: 44%;
	}

	.sk-sets {
		display: grid;
		gap: 0.45rem;
	}

	.sk-set-row {
		height: 2.4rem;
		border-radius: 0.6rem;
	}

	/* ─── Bottom action bar ─── */
	.bottom-action {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.85rem 1rem;
		background: linear-gradient(to top, var(--bg) 70%, transparent);
		max-width: 860px;
		margin: 0 auto;
	}

	@media (max-width: 720px) {
		.topbar {
			justify-content: space-between;
		}
	}
</style>
