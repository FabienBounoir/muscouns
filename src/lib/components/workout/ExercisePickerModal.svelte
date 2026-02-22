<script>
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let searching = false;
	export let search = '';
	/** @type {Array<{ id: string; name: string; target: string }>} */
	export let searchResults = [];
	export let createName = '';
	export let createTarget = '';

	const dispatch = createEventDispatcher();

	const onClose = () => dispatch('close');
	/** @param {string} value */
	const onSearchInput = (value) => dispatch('searchInput', { value });
	/** @param {{ id: string; name: string; target: string }} exercise */
	const onAddExercise = (exercise) => dispatch('addExercise', { exercise });
	/** @param {string} value */
	const onCreateNameInput = (value) => dispatch('createNameInput', { value });
	/** @param {string} value */
	const onCreateTargetInput = (value) => dispatch('createTargetInput', { value });
	const onCreateAndAdd = () => dispatch('createAndAdd');

	let showCreateForm = false;

	$: if (!open) {
		showCreateForm = false;
	}
</script>

{#if open}
	<section class="modal-bg">
		<div class="modal-full">
			<header class="modal-head">
				<h2><i class="fa-solid fa-magnifying-glass"></i> Ajouter un exercice</h2>
				<button class="danger soft" type="button" on:click={onClose}>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</header>

			<div class="modal-content">
				<label for="search-exercise">Rechercher un exercice</label>
				<input
					id="search-exercise"
					type="text"
					placeholder="Ex: Développé incliné"
					value={search}
					on:input={(event) => onSearchInput(event.currentTarget.value)}
				/>

				{#if searching}
					<p class="state"><i class="fa-solid fa-spinner fa-spin"></i> Recherche...</p>
				{:else if searchResults.length > 0}
					<ul class="results">
						{#each searchResults as exercise}
							<li>
								<div class="result-content">
									<p class="result-name">{exercise.name}</p>
									{#if exercise.target}
										<span class="target-pill">{exercise.target}</span>
									{/if}
								</div>
								<button class="soft" type="button" on:click={() => onAddExercise(exercise)}>
									<i class="fa-solid fa-plus"></i>
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="state"><i class="fa-regular fa-face-frown"></i> Aucun résultat trouvé</p>

					<button class="link-action" type="button" on:click={() => (showCreateForm = !showCreateForm)}>
						<i class="fa-solid fa-sparkles"></i>
						{showCreateForm ? 'Fermer la création' : 'Créer un nouvel exercice'}
					</button>

					{#if showCreateForm}
						<div class="create-box">
							<input
								type="text"
								placeholder="Nom du nouvel exercice"
								value={createName}
								on:input={(event) => onCreateNameInput(event.currentTarget.value)}
							/>
							<input
								type="text"
								placeholder="Muscle cible"
								value={createTarget}
								on:input={(event) => onCreateTargetInput(event.currentTarget.value)}
							/>
							<button type="button" on:click={onCreateAndAdd}>
								<i class="fa-solid fa-wand-magic-sparkles"></i> Créer et ajouter
							</button>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</section>
{/if}

<style>
	.modal-bg {
		position: fixed;
		inset: 0;
		z-index: 30;
		background: var(--bg);
	}

	.modal-full {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		background: var(--surface-1);
		color: var(--text-1);
	}

	.modal-head {
		padding: 0.85rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		background: var(--surface-1);
	}

	.modal-head h2 {
		font-size: 1.05rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-1);
	}

	.modal-head h2 i {
		color: var(--accent-2);
	}

	.modal-content {
		padding: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		overflow: auto;
	}

	label {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-2);
	}

	input {
		width: 100%;
		border-radius: 0.75rem;
		border: 1px solid var(--border);
		background: var(--surface-3);
		color: var(--text-1);
		padding: 0.65rem 0.85rem;
		min-height: 48px;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	input:focus {
		outline: none;
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	button {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font-weight: 700;
		border: none;
		border-radius: 0.75rem;
		padding: 0.65rem 0.75rem;
		min-height: 48px;
		background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
		color: #fff;
		box-shadow: 0 2px 16px rgba(199, 53, 255, 0.22);
		transition: opacity 0.15s;
	}

	button.soft {
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-2);
		box-shadow: none;
		width: auto;
		padding: 0.5rem 0.75rem;
		min-height: unset;
	}

	button.soft:hover {
		border-color: var(--border-hover);
		color: var(--text-1);
	}

	button.danger {
		background: var(--danger-dim);
		border: 1px solid rgba(255, 92, 138, 0.25);
		color: var(--danger);
		box-shadow: none;
		width: auto;
		padding: 0.45rem 0.7rem;
		min-height: unset;
	}

	.results {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0;
		margin: 0.15rem 0 0;
	}

	.results li {
		display: flex;
		justify-content: space-between;
		gap: 0.6rem;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: 0.8rem;
		padding: 0.55rem 0.65rem;
		background: var(--surface-2);
		transition: border-color 0.15s;
	}

	.results li:hover {
		border-color: var(--border-hover);
	}

	.result-name {
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--text-1);
	}

	.result-content {
		display: grid;
		gap: 0.2rem;
	}

	.target-pill {
		display: inline-block;
		width: fit-content;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		background: var(--accent-glow);
		border: 1px solid rgba(199, 53, 255, 0.25);
		font-size: 0.72rem;
		color: var(--accent-2);
		font-weight: 600;
	}

	.link-action {
		background: transparent;
		border: 1px dashed var(--border-hover);
		color: var(--text-2);
		box-shadow: none;
		margin-top: 0.1rem;
	}

	.link-action:hover {
		color: var(--text-1);
		background: var(--surface-2);
	}

	.create-box {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 0.65rem;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		background: var(--surface-2);
	}

	.state {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.88rem;
		color: var(--text-2);
		margin-top: 0.15rem;
	}
</style>
