const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/regista-agency';

// Define schemas inline for the seed script
const ClientSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  createdAt: { type: Date, default: Date.now },
});

const AutomationSchema = new mongoose.Schema({
  name: String,
  description: String,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  status: String,
  createdAt: { type: Date, default: Date.now },
});

const MetricSchema = new mongoose.Schema({
  automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation' },
  date: Date,
  emailsSent: Number,
  conversions: Number,
  revenue: Number,
});

const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Automation = mongoose.models.Automation || mongoose.model('Automation', AutomationSchema);
const Metric = mongoose.models.Metric || mongoose.model('Metric', MetricSchema);

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Client.deleteMany({});
    await Automation.deleteMany({});
    await Metric.deleteMany({});

    // Create clients
    console.log('👥 Creating clients...');
    const client1 = await Client.create({
      name: 'CVC Solutions Pro',
    });

    const client2 = await Client.create({
      name: 'Thermique Industrie',
    });

    // Create users
    console.log('🔐 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    await User.create({
      email: 'client1@example.com',
      password: hashedPassword,
      role: 'client',
      clientId: client1._id,
    });

    await User.create({
      email: 'client2@example.com',
      password: hashedPassword,
      role: 'client',
      clientId: client2._id,
    });

    await User.create({
      email: 'admin@regista-agency.fr',
      password: hashedPassword,
      role: 'admin',
    });

    // Create automations for client 1
    console.log('⚙️  Creating automations...');
    const automation1 = await Automation.create({
      name: 'Relance Devis Curatif',
      description:
        'Relance automatique des devis de petite réparation (fuite, vanne, etc.) non suivis. Permet de récupérer 20% de CA SAV.',
      clientId: client1._id,
      status: 'active',
    });

    const automation2 = await Automation.create({
      name: 'Facturation Post-Intervention',
      description:
        'Génération automatique de facture après clôture d\'intervention. Libère 150k€ de trésorerie en accélérant le DSO.',
      clientId: client1._id,
      status: 'active',
    });

    const automation3 = await Automation.create({
      name: 'Rappel Maintenance Annuelle',
      description:
        'Envoi automatique de rappel de maintenance préventive 30 jours avant échéance. Réduit les pannes et fidélise.',
      clientId: client1._id,
      status: 'inactive',
    });

    // Create automations for client 2
    const automation4 = await Automation.create({
      name: 'Lead Chauffage Collectif',
      description:
        'Qualification automatique des leads provenant du site web pour chauffage collectif. Taux de conversion +35%.',
      clientId: client2._id,
      status: 'active',
    });

    const automation5 = await Automation.create({
      name: 'Suivi Satisfaction Client',
      description:
        'Envoi automatique de questionnaire de satisfaction 7 jours après intervention. Améliore NPS et collecte témoignages.',
      clientId: client2._id,
      status: 'active',
    });

    // Generate metrics for last 30 days
    console.log('📊 Generating metrics...');
    const automations = [automation1, automation2, automation3, automation4, automation5];
    const today = new Date();

    for (const automation of automations) {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Generate realistic data based on automation type
        let emailsSent, conversions, revenue;

        if (automation.status === 'active') {
          // Random but realistic numbers
          emailsSent = Math.floor(Math.random() * 50) + 20; // 20-70 emails
          conversions = Math.floor(emailsSent * (Math.random() * 0.15 + 0.05)); // 5-20% conversion
          revenue = conversions * (Math.random() * 800 + 200); // 200-1000€ per conversion
        } else {
          // Inactive automation
          emailsSent = 0;
          conversions = 0;
          revenue = 0;
        }

        await Metric.create({
          automationId: automation._id,
          date,
          emailsSent,
          conversions,
          revenue: Math.round(revenue),
        });
      }
    }

    console.log('✨ Seed completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('Client 1: client1@example.com / password123');
    console.log('Client 2: client2@example.com / password123');
    console.log('Admin: admin@regista-agency.fr / password123');
    console.log('\n🎯 Automations created:', automations.length);
    console.log('📊 Metrics generated: 30 days x', automations.length, '=', automations.length * 30, 'entries');

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
