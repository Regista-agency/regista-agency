#!/bin/bash

set -e

echo "🚀 Regista Agency - Docker Setup"
echo "================================"
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
sleep 10

# Check if services are running
if [ "$(docker-compose ps -q mongodb)" ]; then
    echo "✅ MongoDB démarré"
else
    echo "❌ Problème avec MongoDB"
    docker-compose logs mongodb
    exit 1
fi

if [ "$(docker-compose ps -q nextjs)" ]; then
    echo "✅ Next.js démarré"
else
    echo "❌ Problème avec Next.js"
    docker-compose logs nextjs
    exit 1
fi

# Seed database
echo ""
echo "🌱 Seeding de la base de données..."
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
echo "================================"
echo "✨ Installation terminée!"
echo ""
echo "📝 Comptes de test:"
echo "   - client1@example.com / password123"
echo "   - client2@example.com / password123"
echo "   - admin@regista-agency.fr / password123"
echo ""
echo "🌐 URLs:"
echo "   - Application: http://localhost:3000"
echo "   - MongoDB Express: http://localhost:8081"
echo ""
echo "📚 Commandes utiles:"
echo "   - make logs          # Voir les logs"
echo "   - make down          # Arrêter"
echo "   - make restart       # Redémarrer"
echo "   - make shell         # Shell Next.js"
echo "   - make mongo-shell   # Shell MongoDB"
echo "   - make help          # Toutes les commandes"
echo ""
echo "================================"
