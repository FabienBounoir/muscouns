<script>
	import { page } from '$app/stores';
</script>

<main>
	<h1>Erreur</h1>
	<p>{$page.error?.message || 'Une erreur est survenue.'}</p>
	<a href="/">Retour à l’accueil</a>
</main>

<style>
	main {
		text-align: center;
		padding: 15vw;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
