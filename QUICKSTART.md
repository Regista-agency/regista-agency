# 🚀 Quick Start avec Docker (PostgreSQL + Prisma)

## Installation rapide

```bash
# Méthode 1: Script automatique
./start-docker.sh

# Méthode 2: Make command
make install

# Méthode 3: Docker Compose manuel
docker-compose up -d --build
sleep 15
docker-compose exec nextjs npx prisma db push
docker-compose exec nextjs npx prisma generate
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

# Logs PostgreSQL uniquement
docker-compose logs -f postgres

# Avec Make
make logs
make logs-nextjs
```

### Accès aux containers

```bash
# Shell Next.js
docker-compose exec nextjs sh
# ou
make shell

# PostgreSQL shell
docker-compose exec postgres psql -U regista -d regista_agency
# ou
make mongo-shell

# Prisma Studio (interface graphique)
docker-compose exec nextjs npx prisma studio
# ou
make db-studio
```

### Base de données

```bash
# Seeder
docker-compose exec nextjs npm run seed
# ou
make seed

# Push schema Prisma
docker-compose exec nextjs npx prisma db push

# Prisma Studio
docker-compose exec nextjs npx prisma studio

# Backup
make backup

# Restore
make restore BACKUP=./backups/backup-20240101-120000.sql
```

## URLs après démarrage

- **Application:** http://localhost:3000
- **pgAdmin:** http://localhost:5050
  - Email: admin@regista-agency.fr
  - Password: admin123
- **PostgreSQL:** localhost:5432
  - User: regista
  - Password: regista123
  - Database: regista_agency

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
lsof -ti:5432 | xargs kill -9
# ou
docker-compose down && docker-compose up -d
```

### Rebuild complet

```bash
docker-compose down -v
docker-compose up -d --build
sleep 15
docker-compose exec nextjs npx prisma db push
docker-compose exec nextjs npx prisma generate
docker-compose exec nextjs npm run seed
```

### Problème Prisma

```bash
# Régénérer le client
docker-compose exec nextjs npx prisma generate

# Réinitialiser la base
docker-compose exec nextjs npx prisma migrate reset
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
# PostgreSQL
DATABASE_URL=postgresql://regista:secure-password@postgres:5432/regista_agency

# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://demo.regista-agency.fr

# App
NEXT_PUBLIC_APP_NAME=Regista Agency
NEXT_PUBLIC_APP_URL=https://demo.regista-agency.fr
```

## Prisma

### Commandes utiles

```bash
# Studio (interface graphique)
docker-compose exec nextjs npx prisma studio

# Migration
docker-compose exec nextjs npx prisma migrate dev --name description

# Reset database
docker-compose exec nextjs npx prisma migrate reset

# Voir le schéma
docker-compose exec nextjs npx prisma format
```

## Aide

```bash
# Liste de toutes les commandes Make
make help
```
