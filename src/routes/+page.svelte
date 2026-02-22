<main class="app">
	<section class="panel hero">
		<p class="logo"><i class="fa-solid fa-dumbbell"></i> Muscouns</p>
		<h1>Ton suivi muscu mobile, clair et rapide.</h1>
		<p class="subtitle">Crée tes entraînements, ajoute tes exercices, note reps et poids sans friction.</p>
		<div class="actions">
			<a class="btn-primary" href="/register"><i class="fa-solid fa-rocket"></i> Démarrer</a>
			<a class="btn-ghost" href="/me"><i class="fa-solid fa-user"></i> Mon espace</a>
		</div>
	</section>

	<section class="features" id="features">
		<article class="panel card">
			<h2><i class="fa-solid fa-list-check"></i> Entraînements structurés</h2>
			<p class="subtitle">Organise chaque séance par exercices et garde une vue claire de ta progression.</p>
		</article>
		<article class="panel card">
			<h2><i class="fa-solid fa-weight-hanging"></i> Saisie ultra rapide</h2>
			<p class="subtitle">Renseigne séries, reps et charge en quelques tap sans quitter l’écran.</p>
		</article>
		<article class="panel card">
			<h2><i class="fa-solid fa-cloud-arrow-up"></i> Sauvegarde auto</h2>
			<p class="subtitle">Tes modifications sont enregistrées automatiquement pendant ta séance.</p>
		</article>
	</section>
</main>

<style>
	.app {
		max-width: 920px;
		margin: 0 auto;
		padding: 1rem;
		display: grid;
		gap: 1rem;
	}

	.panel {
		border: 1px solid var(--border);
		background: var(--surface-1);
		border-radius: 1rem;
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
		color: var(--text-1);
	}

	.hero {
		gap: 0.9rem;
		padding: 1.4rem 1.2rem;
		background:
			radial-gradient(ellipse at top right, rgba(199, 53, 255, 0.18) 0%, transparent 65%),
			var(--surface-1);
	}

	.logo {
		font-size: 1.15rem;
		font-weight: 800;
		color: var(--accent-2);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	h1 {
		font-size: clamp(1.5rem, 4.6vw, 2.2rem);
		line-height: 1.18;
		font-weight: 800;
		color: var(--text-1);
	}

	.subtitle {
		font-size: 0.92rem;
		color: var(--text-2);
		line-height: 1.55;
	}

	.actions {
		display: grid;
		gap: 0.6rem;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	a {
		text-decoration: none;
	}

	.btn-primary,
	.btn-ghost {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		width: 100%;
		border-radius: 0.75rem;
		padding: 0.75rem;
		font-weight: 700;
		font-size: 0.92rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
		color: #fff;
		box-shadow: 0 2px 16px rgba(199, 53, 255, 0.3);
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, var(--primary-600), var(--primary-400));
	}

	.btn-ghost {
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-1);
	}

	.btn-ghost:hover {
		border-color: var(--border-hover);
	}

	.features {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	}

	.card {
		gap: 0.5rem;
	}

	.card h2 {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text-1);
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.card h2 i {
		color: var(--accent-2);
	}

	@media (max-width: 720px) {
		.actions {
			grid-template-columns: 1fr;
		}

		.features {
			grid-template-columns: 1fr;
		}
	}
</style>
