# Muscouns

Muscouns est une application SvelteKit mobile-first pour suivre ses entraînements de musculation avec un système collaboratif d'exercices.

## Fonctionnalités MVP

- Création de compte et connexion (JWT)
- Création d'entraînements par utilisateur
- Ajout d'exercices à un entraînement
- Ajout de séries (répétitions + poids)
- Collection MongoDB collaborative des exercices (partagée entre utilisateurs)
- Design sombre violet optimisé mobile

## Variables d'environnement

Créer un fichier `.env` avec:

```bash
MONGO_DB_URI=mongodb://localhost:27017
MONGO_DB_NAME=muscouns
JWT_SECRET=change-me
```

Compatibilité conservée avec les anciennes variables `VITE_MONGO_DB_URI`, `VITE_MONGO_DB_NAME` et `VITE_JWT_SECRET`.

## Démarrage

```bash
npm install
npm run dev
```

## Vérification

```bash
npm run check
npm run build
```

## Notes techniques

- API backend SvelteKit sous `src/routes/_api`
- Collections MongoDB: `users`, `workouts`, `exercises`
