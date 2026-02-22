<script>
	import { createEventDispatcher } from 'svelte';

	/** @type {{
	 *  id: string;
	 *  name: string;
	 *  target: string;
	 *  sets: Array<{ id: string; reps: number; weight: number }>;
	 * }} */
	export let exercise;
	/** @type {number} */
	export let exerciseIndex;

	const dispatch = createEventDispatcher();

	const onRemoveExercise = () => {
		dispatch('removeExercise', { exerciseIndex });
	};

	const onAddSet = () => {
		dispatch('addSet', { exerciseIndex });
	};

	/** @param {number} setIndex */
	const onRemoveSet = (setIndex) => {
		dispatch('removeSet', { exerciseIndex, setIndex });
	};

	/** @param {number} setIndex @param {'reps'|'weight'} field @param {string} value */
	const onUpdateSetField = (setIndex, field, value) => {
		dispatch('updateSetField', { exerciseIndex, setIndex, field, value });
	};
</script>

<article class="panel exercise">
	<div class="row">
		<div>
			<p class="exercise-name">{exercise.name}</p>
			<p class="subtitle">{exercise.target || 'Non précisé'}</p>
		</div>
		<button class="danger soft" type="button" on:click={onRemoveExercise}>
			<i class="fa-solid fa-trash"></i>
		</button>
	</div>

	{#if exercise.sets?.length > 0}
		<div class="sets">
			<div class="set-head">
				<span>Répétitions</span>
				<span>Poids (kg)</span>
				<span>Supprimer</span>
			</div>
			{#each exercise.sets as setItem, setIndex}
				<div class="set-row">
					<input
						type="number"
						min="0"
						step="1"
						value={setItem.reps}
						on:input={(event) => onUpdateSetField(setIndex, 'reps', event.currentTarget.value)}
					/>
					<input
						type="number"
						min="0"
						step="0.5"
						value={setItem.weight}
						on:input={(event) => onUpdateSetField(setIndex, 'weight', event.currentTarget.value)}
					/>
					<button class="danger soft" type="button" on:click={() => onRemoveSet(setIndex)}>
						<i class="fa-solid fa-xmark"></i>
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<button class="soft" type="button" on:click={onAddSet}>
		<i class="fa-solid fa-layer-group"></i> Ajouter une série
	</button>
</article>

<style>
	.panel {
		border: 1px solid var(--border);
		background: var(--surface-1);
		border-radius: 1rem;
		padding: 1rem;
		display: grid;
		gap: 0.65rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
		color: var(--text-1);
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		align-items: center;
	}

	.exercise-name {
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-1);
	}

	.subtitle {
		color: var(--text-2);
		font-size: 0.82rem;
		margin-top: 0.1rem;
	}

	input {
		width: 100%;
		border-radius: 0.65rem;
		border: 1px solid var(--border);
		background: var(--surface-3);
		color: var(--text-1);
		padding: 0.5rem 0.45rem;
		text-align: center;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	input:focus {
		outline: none;
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font-weight: 700;
		border: none;
		border-radius: 0.65rem;
		padding: 0.5rem 0.7rem;
		background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
		color: #fff;
		transition: opacity 0.15s;
	}

	button.soft {
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-2);
		width: auto;
	}

	button.soft:hover {
		border-color: var(--border-hover);
		color: var(--text-1);
	}

	button.danger {
		background: var(--danger-dim);
		border: 1px solid rgba(255, 92, 138, 0.25);
		color: var(--danger);
	}

	button.danger:hover {
		background: rgba(255, 92, 138, 0.2);
	}

	.sets {
		display: grid;
		gap: 0.35rem;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 0.8rem;
		padding: 0.55rem;
	}

	.set-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 72px;
		gap: 0.4rem;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-3);
		font-weight: 700;
		padding: 0 0.15rem;
	}

	.set-head span:last-child {
		text-align: center;
	}

	.set-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 72px;
		gap: 0.4rem;
		align-items: center;
	}

	.set-row input {
		margin: 0;
	}
</style>
