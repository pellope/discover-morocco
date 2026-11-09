# Discover Morocco

Application web de planification de voyage au Maroc basée sur le budget.

- `client/` — interface React + Vite (français, anglais, arabe)
- `server/` — API Node.js + Express avec base SQLite (comptes, voyages, Budget Coach)

## Lancer le projet

Il faut Node.js 20 ou plus récent.

```bash
npm install
npm run install:all
cp server/.env.example server/.env
```

Ouvrir `server/.env` et renseigner `JWT_SECRET` (32 caractères minimum). Pour en générer un :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
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

## Fonctionnement

1. La page d'accueil présente les 14 destinations sous forme de cartes, avec des catégories
   (culture, plage, désert, aventure, gastronomie).
2. La barre de recherche prend le budget total, la durée et le nombre de voyageurs :
   les villes qui rentrent dans le budget sont affichées en premier.
3. La page d'une ville contient la carte « Planifier ce voyage » : le Budget Coach calcule le budget
   par jour et par personne, indique s'il est serré, confortable ou large, et le répartit entre
   hébergement, transport, repas, activités et imprévus.
4. Avec un compte, l'utilisateur sauvegarde ses voyages (« Mes voyages ») et ses villes préférées (« Favoris »).

Les seuils et pourcentages du Budget Coach se règlent dans `server/src/budgetCoach.js`.
Les villes (noms, descriptions, budget minimum estimé, photo) sont dans `server/src/destinations.js` :
les photos sont dans `client/public/images/`. Elles viennent de Wikimedia Commons, sous licences libres ;
leurs auteurs sont cités sur la page « Crédits photos » (`client/src/photoCredits.js`), à compléter si vous
ajoutez ou remplacez une photo.
Les routes de l'API sont décrites dans `server/README.md`.

## Prochaines étapes

- Connexion avec Google
- API Google Places (hôtels, restaurants, activités)
- Plan jour par jour avec les coûts
- Carte des étapes
