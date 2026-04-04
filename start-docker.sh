#!/bin/bash

set -e

echo "🚀 Regista Agency - Docker Setup (PostgreSQL + Prisma)"
echo "======================================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker et réessayer."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose n'est pas installé"
    exit 1
fi

echo "✅ Docker est prêt"
echo ""

# Stop existing containers
echo "🛑 Arrêt des containers existants..."
docker-compose down 2>/dev/null || true

# Start services
echo "🏗️  Démarrage des services..."
docker-compose up -d --build

# Wait for services
echo "⏳ Attente du démarrage des services..."
sleep 15

# Check if services are running
if [ "$(docker-compose ps -q postgres)" ]; then
    echo "✅ PostgreSQL démarré"
else
    echo "❌ Problème avec PostgreSQL"
    docker-compose logs postgres
    exit 1
fi

if [ "$(docker-compose ps -q nextjs)" ]; then
    echo "✅ Next.js démarré"
else
    echo "❌ Problème avec Next.js"
    docker-compose logs nextjs
    exit 1
fi

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Attente de PostgreSQL..."
sleep 5

# Push Prisma schema
echo ""
echo "📊 Push du schéma Prisma..."
docker-compose exec -T nextjs npx prisma db push --skip-generate || {
    echo "⚠️  Erreur lors du push du schéma, tentative de migration..."
    docker-compose exec -T nextjs npx prisma migrate deploy || true
}

# Generate Prisma Client
echo "🔧 Génération du Prisma Client..."
docker-compose exec -T nextjs npx prisma generate

# Seed database
echo ""
echo "🌱 Seeding de la base de données PostgreSQL..."
docker-compose exec -T nextjs npm run seed

# Test the application
echo ""
echo "🧪 Test de l'application..."
sleep 5

if curl -s http://localhost:3000/login | grep -q "Regista Agency"; then
    echo "✅ Application accessible"
else
    echo "⚠️  L'application met du temps à démarrer, veuillez patienter..."
fi

echo ""
echo "======================================================"
echo "✨ Installation terminée!"
echo ""
echo "📝 Comptes de test:"
echo "   - client1@example.com / password123"
echo "   - client2@example.com / password123"
echo "   - admin@regista-agency.fr / password123"
echo ""
echo "🌐 URLs:"
echo "   - Application: http://localhost:3000"
echo "   - pgAdmin: http://localhost:5050"
echo "     Email: admin@regista-agency.fr"
echo "     Password: admin123"
echo ""
echo "🗄️  PostgreSQL:"
echo "   - Host: localhost"
echo "   - Port: 5432"
echo "   - User: regista"
echo "   - Password: regista123"
echo "   - Database: regista_agency"
echo ""
echo "📚 Commandes utiles:"
echo "   - make logs          # Voir les logs"
echo "   - make down          # Arrêter"
echo "   - make restart       # Redémarrer"
echo "   - make shell         # Shell Next.js"
echo "   - docker-compose exec postgres psql -U regista -d regista_agency"
echo "   - docker-compose exec nextjs npx prisma studio"
echo "   - make help          # Toutes les commandes"
echo ""
echo "======================================================"
