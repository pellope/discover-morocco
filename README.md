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

1. L'utilisateur choisit sa langue et crée un compte.
2. Il remplit le formulaire : destination, type de voyage, budget, durée, nombre de personnes.
3. Le Budget Coach calcule le budget par jour et par personne, indique s'il est serré,
   confortable ou large, et le répartit entre hébergement, transport, repas, activités et imprévus.
4. Il sauvegarde le voyage et le retrouve dans « Mes voyages ».

Les seuils et pourcentages du Budget Coach se règlent dans `server/src/budgetCoach.js`.
Les routes de l'API sont décrites dans `server/README.md`.

## Prochaines étapes

- Connexion avec Google
- API Google Places (hôtels, restaurants, activités)
- Plan jour par jour avec les coûts
- Carte des étapes
