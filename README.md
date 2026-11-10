# Discover Morocco

Application web de planification de voyage au Maroc basée sur le budget.

- `client/` — interface React + Vite (français, anglais, arabe ; thème clair et sombre)
- `server/` — API Node.js + Express avec base SQLite

## Lancer le projet

Il faut Node.js 20 ou plus récent.

```bash
npm install
npm run install:all
```

Créer le fichier `server/.env` avec une clé secrète aléatoire :

```bash
node -e "require('fs').writeFileSync('server/.env','JWT_SECRET='+require('crypto').randomBytes(48).toString('hex')+'\n')"
```

Puis démarrer le serveur et l'interface ensemble :

```bash
npm run dev
```

L'application est sur http://localhost:5173 et l'API sur http://localhost:4000.

## Tests

```bash
npm test
```

## Fonctions

**Découvrir**
- 14 destinations avec photos, galerie, note des voyageurs, météo par mois et guide pratique.
- Recherche par budget (les villes qui rentrent dans le budget passent en premier), par nom, tri, filtres par type de voyage.
- Carte du Maroc, comparaison de deux villes, quiz « quelle ville est faite pour vous ? ».

**Planifier**
- Budget Coach : budget par jour et par personne, niveau serré / confortable / large, répartition par poste.
- Trois niveaux de confort (routard, confort, luxe) et date de départ : le budget minimum conseillé
  tient compte du confort et de la haute saison.
- Plan jour par jour avec activités et coûts estimés, modifiable une fois le voyage sauvegardé.
- Circuits de deux à cinq villes, avec estimation des trajets.

**Pendant le voyage** (avec un compte)
- Voyages sauvegardés, favoris, partage par lien, impression / PDF.
- Suivi des dépenses par poste, comptes entre voyageurs, liste de bagages.

**Compte**
- Inscription par e-mail ou avec Google, profil, changement de mot de passe, suppression du compte.
- Avis et notes sur les villes.

**Affichage**
- Trois langues, montants en MAD, EUR ou USD, mode sombre.

## Où modifier les données

| Quoi | Fichier |
|---|---|
| Villes, budgets minimums, climat, accès, conseils | `server/src/destinations.js` |
| Activités et leurs prix | `server/src/activities.js` |
| Seuils, répartition et niveaux de confort du Budget Coach | `server/src/budgetCoach.js` |
| Taux de change (approximatifs) | `server/src/app.js` |
| Liste de bagages | `server/src/packing.js` |
| Textes de l'interface | `client/src/i18n.js` et `client/src/i18n2.js` |
| Photos et crédits | `client/public/images/` et `client/src/photoCredits.js` |

Les budgets, prix, températures et taux sont des estimations saisies à la main, en attendant une source de
données réelle (API Google Places). Les photos viennent de Wikimedia Commons, sous licences libres ; leurs
auteurs sont cités sur la page « Crédits photos », à compléter si vous ajoutez ou remplacez une photo.

Les routes de l'API sont décrites dans `server/README.md`.

## Connexion avec Google

1. Dans [Google Cloud Console](https://console.cloud.google.com/), créer un projet, puis
   « API et services » → « Identifiants » → « Créer des identifiants » → « ID client OAuth » → « Application Web ».
2. Dans « Origines JavaScript autorisées », ajouter l'adresse du site (`http://localhost:5173` en développement,
   puis l'adresse de production).
3. Copier l'identifiant client dans `server/.env` : `GOOGLE_CLIENT_ID=...`, puis redémarrer le serveur.

Sans cette variable, le bouton « Continuer avec Google » n'apparaît pas et le reste fonctionne normalement.

## Mise en ligne

En production, un seul serveur suffit : Express distribue l'API et l'interface compilée.

```bash
npm run install:all
npm run build
npm start
```

Chez un hébergeur Node.js (Render, Railway, un VPS…) :

- commande de construction : `npm run install:all && npm run build` ;
- commande de démarrage : `npm start` ;
- variables d'environnement : `JWT_SECRET` (obligatoire), `PORT` si l'hébergeur l'impose, `GOOGLE_CLIENT_ID` (facultatif) ;
- la base SQLite est un fichier (`DATABASE_FILE`) : il faut un **disque persistant**, sinon les comptes et les
  voyages sont perdus à chaque redémarrage.

## Prochaines étapes

- API Google Places (hôtels, restaurants, activités et prix réels)
- Taux de change et météo en temps réel
