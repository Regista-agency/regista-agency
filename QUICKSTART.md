# 🚀 Quick Start avec Docker

## Installation rapide

```bash
# Méthode 1: Script automatique
./start-docker.sh

# Méthode 2: Make command
make install

# Méthode 3: Docker Compose manuel
docker-compose up -d --build
sleep 10
docker-compose exec nextjs npm run seed
```

## Commandes essentielles

### Démarrage / Arrêt

```bash
# Démarrer
docker-compose up -d
# ou
make dev

# Arrêter
docker-compose down
# ou
make down

# Redémarrer
docker-compose restart
# ou
make restart
```

### Logs

```bash
# Tous les logs
docker-compose logs -f

# Logs Next.js uniquement
docker-compose logs -f nextjs

# Logs MongoDB uniquement
docker-compose logs -f mongodb

# Avec Make
make logs
make logs-nextjs
make logs-mongo
```

### Accès aux containers

```bash
# Shell Next.js
docker-compose exec nextjs sh
# ou
make shell

# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123 regista-agency
# ou
make mongo-shell
```

### Base de données

```bash
# Seeder
docker-compose exec nextjs npm run seed
# ou
make seed

# Backup
make backup

# Restore
make restore BACKUP=./backups/backup-20240101-120000
```

## URLs après démarrage

- **Application:** http://localhost:3000
- **MongoDB Express:** http://localhost:8081
- **MongoDB:** mongodb://admin:admin123@localhost:27017/regista-agency

## Comptes de test

```
Email: client1@example.com
Password: password123

Email: client2@example.com
Password: password123

Email: admin@regista-agency.fr
Password: password123
```

## Troubleshooting

### Port déjà utilisé

```bash
# Trouver et tuer le processus
lsof -ti:3000 | xargs kill -9
# ou
docker-compose down && docker-compose up -d
```

### Rebuild complet

```bash
docker-compose down -v
docker-compose up -d --build
docker-compose exec nextjs npm run seed
```

### Nettoyer tout

```bash
# Avec Make
make prune

# Manuel
docker-compose down -v
docker system prune -af --volumes
```

## Production

```bash
# Build production
docker-compose -f docker-compose.prod.yml build

# Démarrer
docker-compose -f docker-compose.prod.yml up -d

# Avec Make
make prod-build
make prod-up
```

## Monitoring

```bash
# Status
docker-compose ps
# ou
make status

# Stats
docker stats
# ou
make stats

# Health check
docker-compose ps
```

## Variables d'environnement

Créer un fichier `.env.production` pour la production:

```bash
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=votre-password-securise
MONGODB_URI=mongodb://admin:password@mongodb:27017/regista-agency?authSource=admin
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://demo.regista-agency.fr
NEXT_PUBLIC_APP_NAME=Regista Agency
NEXT_PUBLIC_APP_URL=https://demo.regista-agency.fr
```

## Aide

```bash
# Liste de toutes les commandes Make
make help
```
