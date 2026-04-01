# Regista Agency - Dashboard Client SaaS

Application SaaS pour le suivi des automatisations métier développée avec Next.js 14+ App Router.

## 🚀 Stack Technique

- **Framework:** Next.js 14+ avec App Router
- **Langage:** TypeScript
- **Base de données:** MongoDB avec Mongoose
- **Authentification:** NextAuth.js v5
- **UI:** Tailwind CSS v4 + shadcn/ui components
- **Charts:** Chart.js avec react-chartjs-2
- **Icons:** Lucide React

## 📦 Installation

### Option 1: Docker (Recommandé) 🐳

**Démarrage rapide:**

```bash
# Méthode automatique
./start-docker.sh

# Ou avec Make
make install

# Ou manuellement
docker-compose up -d --build
docker-compose exec nextjs npm run seed
```

L'application sera accessible sur:
- **App:** http://localhost:3000
- **MongoDB Express:** http://localhost:8081

📚 **Plus d'infos:** Voir [README.docker.md](./README.docker.md) et [QUICKSTART.md](./QUICKSTART.md)

### Option 2: Installation locale

Les dépendances sont déjà installées. Pour réinstaller :

```bash
npm install
```

Assurez-vous que MongoDB est installé et en cours d'exécution:

```bash
# Démarrer MongoDB (si installé localement)
mongod --dbpath /path/to/data
```

## 🗄️ Base de données

### Seeding

Pour générer les données mockées (clients, automatisations, métriques) :

```bash
npm run seed
```

### Comptes de test

Après le seeding, utilisez ces identifiants :

**Client 1:**
- Email: `client1@example.com`
- Mot de passe: `password123`
- Automatisations: 3

**Client 2:**
- Email: `client2@example.com`
- Mot de passe: `password123`
- Automatisations: 2

**Admin:**
- Email: `admin@regista-agency.fr`
- Mot de passe: `password123`
- Accès: toutes les automatisations

## 🏃 Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

### Mode production

```bash
npm run build
npm start
```

## 📁 Structure du projet

```
/app
├── app/
│   ├── (auth)/
│   │   ├── login/              # Page de connexion
│   │   └── signup/             # Page d'inscription
│   ├── dashboard/
│   │   ├── layout.tsx          # Layout avec sidebar
│   │   ├── page.tsx            # Dashboard principal
│   │   └── automations/
│   │       └── [id]/
│   │           └── page.tsx    # Détail d'une automation
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/  # NextAuth API routes
│   │   │   └── signup/         # Création de compte
│   │   └── automations/        # API automations
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Page d'accueil (redirect)
│   └── globals.css             # Styles globaux
├── components/
│   ├── ui/                     # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── Sidebar.tsx             # Barre latérale
│   ├── AutomationCard.tsx      # Card d'automation
│   ├── KPICard.tsx             # Card KPI
│   └── Charts.tsx              # Graphiques
├── lib/
│   ├── db.ts                   # Connexion MongoDB
│   ├── auth.ts                 # Config NextAuth
│   ├── utils.ts                # Utilitaires
│   └── models/                 # Modèles Mongoose
│       ├── User.ts
│       ├── Client.ts
│       ├── Automation.ts
│       └── Metric.ts
├── types/
│   ├── index.ts                # Types principaux
│   ├── next-auth.d.ts          # Types NextAuth
│   └── global.d.ts             # Types globaux
└── scripts/
    └── seed.js                 # Script de seeding
```

## 🎯 Fonctionnalités

### 1. Authentification
- ✅ Login avec email/password
- ✅ Signup (création de compte)
- ✅ Session persistante (JWT)
- ✅ Protection des routes
- ✅ Rôles (client/admin)

### 2. Dashboard Principal
- ✅ Vue d'ensemble des automatisations
- ✅ KPIs globaux:
  - Nombre d'automatisations
  - Emails envoyés (7 jours)
  - Conversions (7 jours)
  - Chiffre d'affaires (7 jours)
- ✅ Liste des automatisations en cards
- ✅ Sidebar avec navigation

### 3. Page Détail Automatisation
- ✅ KPIs spécifiques:
  - Emails envoyés
  - Conversions (devis signés)
  - Chiffre d'affaires généré
  - Taux de conversion
- ✅ Graphiques:
  - Évolution des emails envoyés
  - Évolution des conversions et CA
- ✅ Liste de l'activité récente
- ✅ Statut (actif/inactif)

### 4. Design
- ✅ Interface moderne minimaliste
- ✅ Sidebar fixe à gauche
- ✅ Cards avec ombres
- ✅ Palette de couleurs professionnelle
- ✅ Responsive

## 📊 Modèles de données

### User
```typescript
{
  email: string
  password: string (hashed)
  role: 'client' | 'admin'
  clientId: ObjectId (ref: Client)
  createdAt: Date
}
```

### Client
```typescript
{
  name: string
  createdAt: Date
}
```

### Automation
```typescript
{
  name: string
  description: string
  clientId: ObjectId (ref: Client)
  status: 'active' | 'inactive'
  createdAt: Date
}
```

### Metric
```typescript
{
  automationId: ObjectId (ref: Automation)
  date: Date
  emailsSent: number
  conversions: number
  revenue: number
}
```

## 🔐 Variables d'environnement

Fichier `.env.local` :

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/regista-agency

# NextAuth
NEXTAUTH_SECRET=your-secret-key-change-this-in-production-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_NAME=Regista Agency
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎨 Couleurs du thème

- **Primary:** Bleu (221.2 83.2% 53.3%)
- **Background:** Blanc
- **Card:** Blanc avec ombre légère
- **Accent:** Gris clair
- **Success:** Vert (statut actif)

## 📝 Scripts disponibles

```bash
npm run dev      # Démarrer en mode développement
npm run build    # Build de production
npm start        # Démarrer en mode production
npm run lint     # Linter
npm run seed     # Seed la base de données
```

## 🚦 Workflow de développement

1. **Seeder la base de données**
   ```bash
   npm run seed
   ```

2. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

3. **Accéder à l'application**
   - Ouvrir http://localhost:3000
   - Se connecter avec un compte de test
   - Explorer le dashboard et les automatisations

## 🔄 Données mockées

Le script de seed génère :
- **2 clients** (entreprises CVC)
- **5 automatisations** réalistes:
  1. Relance Devis Curatif
  2. Facturation Post-Intervention
  3. Rappel Maintenance Annuelle
  4. Lead Chauffage Collectif
  5. Suivi Satisfaction Client
- **150 métriques** (30 jours × 5 automations)
- Données réalistes avec variation quotidienne

## 🎯 Cas d'usage métier

### 1. Relance Devis Curatif
- Automatisation de la relance des devis de petite réparation
- ROI: +20% de CA SAV récupéré
- Taux de conversion: 5-20%

### 2. Facturation Post-Intervention
- Génération automatique de facture après intervention
- ROI: 150k€ de trésorerie libérée
- Réduction du DSO de 12 jours à 1 jour

## 📈 Améliorations futures possibles

- [ ] Filtres avancés sur le dashboard
- [ ] Export des données (CSV, PDF)
- [ ] Notifications en temps réel
- [ ] Gestion multi-clients pour admin
- [ ] Personnalisation des automatisations
- [ ] API publique pour intégrations

## 👨‍💻 Développé avec

- Next.js 16.2.2
- React 19
- TypeScript 5
- MongoDB via Mongoose
- NextAuth.js v5 (beta)
- Chart.js 4.5
- Tailwind CSS 4

---

**Regista Agency** - Automatisations métier pour entreprises CVC
