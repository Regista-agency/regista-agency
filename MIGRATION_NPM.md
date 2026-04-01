# Migration Yarn → npm

## ✅ Changements effectués

Tous les fichiers ont été mis à jour pour utiliser **npm** au lieu de yarn.

### Fichiers modifiés

1. **docker-compose.yml**
   - `command: npm run dev` (au lieu de yarn dev)

2. **docker-compose.prod.yml**
   - Pas de changement de commande (utilise le Dockerfile)

3. **Dockerfile**
   - Supprimé: `corepack enable && corepack prepare yarn`
   - `COPY package*.json` (au lieu de package.json yarn.lock*)
   - `RUN npm ci` (au lieu de yarn install --frozen-lockfile)
   - `CMD ["npm", "run", "dev"]` (au lieu de yarn dev)
   - `RUN npm run build` (au lieu de yarn build)

4. **Makefile**
   - `npm run seed` (au lieu de yarn seed)
   - Toutes les commandes seed/test mises à jour

5. **start-docker.sh**
   - `npm run seed` (au lieu de yarn seed)

6. **QUICKSTART.md**
   - Tous les exemples de commandes mis à jour

7. **README.md**
   - Section Installation: `npm install`
   - Section Scripts: `npm run dev`, `npm run build`, etc.
   - Section Seeding: `npm run seed`

## 🚀 Utilisation

### Commandes npm

```bash
# Installation
npm install

# Développement
npm run dev

# Production
npm run build
npm start

# Seeding
npm run seed

# Linting
npm run lint
```

### Commandes Docker (inchangées)

```bash
# Démarrer
docker-compose up -d
# ou
make dev

# Seeder
docker-compose exec nextjs npm run seed
# ou
make seed

# Logs
docker-compose logs -f nextjs
```

## 📦 Avantages de npm

- ✅ Inclus nativement avec Node.js
- ✅ Pas besoin d'installer yarn séparément
- ✅ `npm ci` pour des builds reproductibles
- ✅ Plus simple pour les nouveaux développeurs
- ✅ Images Docker légèrement plus petites

## 🔄 Migration d'un projet existant

Si vous avez déjà cloné le projet avec yarn:

```bash
# Supprimer yarn.lock
rm yarn.lock

# Supprimer node_modules
rm -rf node_modules

# Installer avec npm
npm install

# Créer package-lock.json
npm install

# Lancer le projet
npm run dev
```

## ⚠️ Attention

Si vous utilisez Docker, **aucune action n'est nécessaire**. Les containers gèrent automatiquement npm.

```bash
# Rebuild les images si besoin
docker-compose down
docker-compose up -d --build
```

## 📝 Notes

- Le fichier `package.json` reste identique
- Les scripts npm sont les mêmes que les scripts yarn
- `npm ci` est l'équivalent de `yarn install --frozen-lockfile`
- `npm install` est l'équivalent de `yarn install`
- `npm run` est l'équivalent de `yarn run`
