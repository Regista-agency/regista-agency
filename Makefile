.PHONY: help dev up down logs seed clean rebuild restart shell mongo-shell test

# Variables
COMPOSE = docker-compose
COMPOSE_PROD = docker-compose -f docker-compose.prod.yml

help: ## Afficher l'aide
	@echo "Regista Agency - Commandes Docker"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Développement
dev: ## Démarrer en mode développement
	$(COMPOSE) up -d
	@echo "✅ Application démarrée sur http://localhost:3000"
	@echo "✅ MongoDB Express sur http://localhost:8081"

up: dev ## Alias pour dev

down: ## Arrêter tous les services
	$(COMPOSE) down

logs: ## Voir les logs en temps réel
	$(COMPOSE) logs -f

logs-nextjs: ## Logs Next.js uniquement
	$(COMPOSE) logs -f nextjs

logs-mongo: ## Logs MongoDB uniquement
	$(COMPOSE) logs -f mongodb

seed: ## Seeder la base de données
	$(COMPOSE) exec nextjs npm run seed

clean: ## Arrêter et supprimer volumes
	$(COMPOSE) down -v
	@echo "✅ Volumes supprimés"

rebuild: ## Rebuild les images
	$(COMPOSE) up -d --build
	@echo "✅ Images rebuild"

restart: ## Redémarrer les services
	$(COMPOSE) restart

shell: ## Shell dans le container Next.js
	$(COMPOSE) exec nextjs sh

mongo-shell: ## Shell MongoDB
	$(COMPOSE) exec mongodb mongosh -u admin -p admin123 regista-agency

# Production
prod-build: ## Build pour production
	$(COMPOSE_PROD) build --no-cache

prod-up: ## Démarrer en production
	$(COMPOSE_PROD) up -d
	@echo "✅ Application production démarrée"

prod-down: ## Arrêter production
	$(COMPOSE_PROD) down

prod-logs: ## Logs production
	$(COMPOSE_PROD) logs -f

prod-seed: ## Seed production
	$(COMPOSE_PROD) exec nextjs npm run seed

# Maintenance
status: ## Status des containers
	$(COMPOSE) ps

stats: ## Statistiques CPU/Mémoire
	docker stats --no-stream

backup: ## Backup MongoDB
	@mkdir -p ./backups
	$(COMPOSE) exec mongodb mongodump \
		--uri="mongodb://admin:admin123@localhost:27017/regista-agency?authSource=admin" \
		--out=/tmp/backup
	docker cp regista-mongodb:/tmp/backup ./backups/backup-$(shell date +%Y%m%d-%H%M%S)
	@echo "✅ Backup créé dans ./backups/"

restore: ## Restore dernier backup
	@if [ -z "$(BACKUP)" ]; then echo "Usage: make restore BACKUP=./backups/backup-YYYYMMDD-HHMMSS"; exit 1; fi
	docker cp $(BACKUP) regista-mongodb:/tmp/restore
	$(COMPOSE) exec mongodb mongorestore \
		--uri="mongodb://admin:admin123@localhost:27017/regista-agency?authSource=admin" \
		/tmp/restore/regista-agency
	@echo "✅ Backup restauré"

test: ## Tester l'application
	@echo "Testing application..."
	@curl -s http://localhost:3000/login | grep -q "Regista Agency" && echo "✅ Login page OK" || echo "❌ Login page failed"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/automations | grep -q "401" && echo "✅ API protection OK" || echo "❌ API protection failed"

# Installation
install: ## Premier démarrage (build + seed)
	$(COMPOSE) up -d --build
	@echo "Waiting for services to be ready..."
	@sleep 10
	$(COMPOSE) exec nextjs npm run seed
	@echo ""
	@echo "✅ Installation terminée!"
	@echo "📝 Connectez-vous avec: client1@example.com / password123"
	@echo "🌐 Application: http://localhost:3000"
	@echo "🗄️  MongoDB Express: http://localhost:8081"

# Nettoyage complet
prune: ## Nettoyage Docker complet
	@echo "⚠️  Ceci va supprimer TOUS les containers, images et volumes Docker"
	@read -p "Continuer? [y/N] " -n 1 -r; echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -af --volumes; \
		echo "✅ Nettoyage terminé"; \
	fi
