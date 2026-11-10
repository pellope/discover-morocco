# Discover Morocco — API

Back-end Node.js / Express avec une base SQLite. Voir le `README.md` à la racine pour lancer le projet.

Les routes marquées 🔒 exigent l'en-tête `Authorization: Bearer <token>`.
Les erreurs ont la forme `{ "error": { "code": "...", "message": "..." } }` ; l'interface traduit à partir de `code`.

## Compte

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte `{ name, email, password, language? }` → `{ user, token }` |
| POST | `/api/auth/login` | Se connecter `{ email, password }` → `{ user, token }` |
| POST | `/api/auth/google` | Se connecter avec Google `{ credential }` (jeton d'identité Google) |
| GET | `/api/auth/me` 🔒 | Profil de l'utilisateur connecté |
| PATCH | `/api/auth/me` 🔒 | Modifier `{ name?, language? }` |
| POST | `/api/auth/password` 🔒 | Changer le mot de passe `{ currentPassword, newPassword }` |
| DELETE | `/api/auth/me` 🔒 | Supprimer le compte `{ password }` et toutes ses données |

## Destinations

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/destinations` | Liste ; `?type=`, `?budget=&days=&people=` (ajoute `fits` et trie), `?comfort=`, `?month=` |
| GET | `/api/destinations/:id` | Une destination |
| GET | `/api/destinations/:id/places` | Lieux à voir et à goûter dans la ville |
| GET | `/api/destinations/:id/reviews` | Avis et note moyenne |
| PUT / DELETE | `/api/destinations/:id/review` 🔒 | Publier `{ rating, comment? }` ou supprimer son avis |
| GET | `/api/favorites` 🔒 | Identifiants des destinations favorites |
| PUT / DELETE | `/api/favorites/:id` 🔒 | Ajouter / retirer un favori |

## Voyages

Un voyage : `{ tripType, budget, people, comfort?, startDate? }` avec soit `destination` et `days`,
soit `stops: [{ destination, days }, …]` pour un circuit (2 à 5 étapes).
`tripType` : `culture`, `beach`, `desert`, `adventure`, `gastronomy`. `comfort` : `budget`, `comfort`, `luxury`.
Les montants sont en dirhams (MAD).

Chaque voyage renvoyé contient `budgetCoach`, `itinerary` (jours, trajets), `minimum` (budget minimum conseillé)
et `packingList`.

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/budget-coach` | Calculer un voyage sans le sauvegarder |
| GET | `/api/trips` 🔒 | « Mes voyages » |
| POST | `/api/trips` 🔒 | Sauvegarder un voyage |
| GET / PUT / DELETE | `/api/trips/:id` 🔒 | Lire, modifier, supprimer |
| PUT | `/api/trips/:id/plan` 🔒 | Plan modifié `{ days: [[{ name, cost }]] }` ; `{ days: null }` revient au plan proposé |
| GET | `/api/trips/:id/expenses` 🔒 | Dépenses, reste par poste, comptes entre voyageurs |
| POST | `/api/trips/:id/expenses` 🔒 | Ajouter `{ category, label, amount, paidBy? }` |
| DELETE | `/api/trips/:id/expenses/:expenseId` 🔒 | Supprimer une dépense |
| PUT | `/api/trips/:id/travelers` 🔒 | Prénoms des voyageurs `{ travelers: [...] }` |
| GET | `/api/shared/:token` | Voyage partagé par lien, lisible sans compte |

## Divers

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/config` | Taux de change et identifiant client Google |
| GET | `/api/health` | État du serveur |
