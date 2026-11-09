# Discover Morocco — API

Back-end Node.js / Express avec une base SQLite : comptes, voyages et Budget Coach.

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner JWT_SECRET (32 caractères minimum)
npm run dev            # http://localhost:4000
npm test
```

## Routes

Les routes marquées 🔒 exigent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte `{ name, email, password, language? }` → `{ user, token }` |
| POST | `/api/auth/login` | Se connecter `{ email, password }` → `{ user, token }` |
| GET | `/api/auth/me` 🔒 | Profil de l'utilisateur connecté |
| PATCH | `/api/auth/me` 🔒 | Changer la langue `{ language }` (`fr`, `en`, `ar`) |
| GET | `/api/destinations` | Les destinations ; `?type=beach` filtre, `?budget=&days=&people=` ajoute `fits` et trie |
| GET | `/api/destinations/:id` | Une destination |
| GET | `/api/favorites` 🔒 | Identifiants des destinations favorites |
| PUT / DELETE | `/api/favorites/:id` 🔒 | Ajouter / retirer un favori |
| POST | `/api/budget-coach` | Calculer le Budget Coach sans sauvegarder |
| GET | `/api/trips` 🔒 | « Mes voyages » |
| POST | `/api/trips` 🔒 | Sauvegarder un voyage |
| GET / PUT / DELETE | `/api/trips/:id` 🔒 | Lire, modifier, supprimer un voyage |

Un voyage : `{ destination, tripType, budget, days, people }`, avec `destination` l'identifiant d'une
destination et `tripType` parmi
`culture`, `beach`, `desert`, `adventure`, `gastronomy`. Le budget est en dirhams (MAD).
Chaque voyage renvoyé contient son `budgetCoach` (`perDay`, `perDayPerPerson`, `level`, `breakdown`).

Les erreurs ont la forme `{ "error": { "code": "...", "message": "..." } }` ; le front-end
traduit à partir de `code`.

## Réglages du Budget Coach

Les seuils (serré < 400 MAD, confortable < 1000 MAD par jour et par personne) et les
pourcentages par type de voyage sont dans `src/budgetCoach.js`.
