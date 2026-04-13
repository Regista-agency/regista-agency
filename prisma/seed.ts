import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Connecting to PostgreSQL...');
  console.log('✅ Connected to PostgreSQL');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.metric.deleteMany({});
  await prisma.automation.deleteMany({});
  await prisma.automationTemplate.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.client.deleteMany({});

  // Create automation templates for marketplace
  console.log('📦 Creating automation templates...');
  const templates = await prisma.automationTemplate.createMany({
    data: [
      {
        name: 'Relance Devis Curatif',
        description: 'Relance automatique des devis de petite réparation non suivis. Récupérez 20% de CA SAV.',
        category: 'email',
        icon: 'mail',
        defaultSettings: {
          emailSubject: 'Relance de votre devis',
          emailBody: 'Bonjour,\n\nNous revenons vers vous concernant votre devis. N\'hésitez pas à nous contacter pour toute question.\n\nCordialement,',
          delayDays: 7,
          senderName: 'Équipe Commerciale',
          maxAttempts: 3,
        },
        active: true,
      },
      {
        name: 'Facturation Post-Intervention',
        description: 'Génération automatique de facture après clôture d\'intervention. Libérez 150k€ de trésorerie.',
        category: 'facturation',
        icon: 'file-text',
        defaultSettings: {
          autoGenerate: true,
          delayHours: 2,
          sendEmail: true,
          emailSubject: 'Votre facture est disponible',
        },
        active: true,
      },
      {
        name: 'Rappel Maintenance Annuelle',
        description: 'Envoi automatique de rappel de maintenance préventive 30 jours avant échéance.',
        category: 'maintenance',
        icon: 'wrench',
        defaultSettings: {
          emailSubject: 'Rappel de maintenance',
          emailBody: 'Bonjour,\n\nVotre contrat de maintenance arrive à échéance. Nous vous proposons de planifier votre intervention.\n\nCordialement,',
          delayDays: 30,
          senderName: 'Service Maintenance',
        },
        active: true,
      },
      {
        name: 'Lead Chauffage Collectif',
        description: 'Qualification automatique des leads provenant du site web. Taux de conversion +35%.',
        category: 'leads',
        icon: 'users',
        defaultSettings: {
          autoAssign: true,
          scoringEnabled: true,
          minScore: 50,
          notifyEmail: true,
        },
        active: true,
      },
      {
        name: 'Suivi Satisfaction Client',
        description: 'Envoi automatique de questionnaire de satisfaction 7 jours après intervention.',
        category: 'crm',
        icon: 'star',
        defaultSettings: {
          emailSubject: 'Votre avis nous intéresse',
          emailBody: 'Bonjour,\n\nNous espérons que notre intervention vous a donné satisfaction. Pouvez-vous prendre 2 minutes pour nous donner votre avis?\n\nMerci,',
          delayDays: 7,
        },
        active: true,
      },
    ],
  });

  const createdTemplates = await prisma.automationTemplate.findMany();

  // Create clients
  console.log('👥 Creating clients...');
  const client1 = await prisma.client.create({
    data: { name: 'CVC Solutions Pro' },
  });

  const client2 = await prisma.client.create({
    data: { name: 'Thermique Industrie' },
  });

  // Create users
  console.log('🔐 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'client1@example.com',
      password: hashedPassword,
      role: 'client',
      clientId: client1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'client2@example.com',
      password: hashedPassword,
      role: 'client',
      clientId: client2.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@regista-agency.fr',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create automations
  console.log('⚙️  Creating automations...');
  const automation1 = await prisma.automation.create({
    data: {
      name: 'Relance Devis Curatif',
      description: 'Relance automatique des devis de petite réparation (fuite, vanne, etc.) non suivis. Permet de récupérer 20% de CA SAV.',
      clientId: client1.id,
      templateId: createdTemplates[0].id,
      status: 'active',
      settings: createdTemplates[0].defaultSettings ?? {},
    },
  });

  const automation2 = await prisma.automation.create({
    data: {
      name: 'Facturation Post-Intervention',
      description: 'Génération automatique de facture après clôture d\'intervention. Libère 150k€ de trésorerie en accélérant le DSO.',
      clientId: client1.id,
      templateId: createdTemplates[1].id,
      status: 'active',
      settings: createdTemplates[1].defaultSettings ?? {},
    },
  });

  const automation3 = await prisma.automation.create({
    data: {
      name: 'Rappel Maintenance Annuelle',
      description: 'Envoi automatique de rappel de maintenance préventive 30 jours avant échéance. Réduit les pannes et fidélise.',
      clientId: client1.id,
      templateId: createdTemplates[2].id,
      status: 'inactive',
      settings: createdTemplates[2].defaultSettings ?? {},
    },
  });

  const automation4 = await prisma.automation.create({
    data: {
      name: 'Lead Chauffage Collectif',
      description: 'Qualification automatique des leads provenant du site web pour chauffage collectif. Taux de conversion +35%.',
      clientId: client2.id,
      templateId: createdTemplates[3].id,
      status: 'active',
      settings: createdTemplates[3].defaultSettings ?? {},
    },
  });

  const automation5 = await prisma.automation.create({
    data: {
      name: 'Suivi Satisfaction Client',
      description: 'Envoi automatique de questionnaire de satisfaction 7 jours après intervention. Améliore NPS et collecte témoignages.',
      clientId: client2.id,
      templateId: createdTemplates[4].id,
      status: 'active',
      settings: createdTemplates[4].defaultSettings ?? {},
    },
  });

  const automations = [automation1, automation2, automation3, automation4, automation5];

  // Generate metrics for last 30 days
  console.log('📊 Generating metrics...');
  const today = new Date();

  for (const automation of automations) {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      let emailsSent, conversions, revenue;

      if (automation.status === 'active') {
        emailsSent = Math.floor(Math.random() * 50) + 20;
        conversions = Math.floor(emailsSent * (Math.random() * 0.15 + 0.05));
        revenue = conversions * (Math.random() * 800 + 200);
      } else {
        emailsSent = 0;
        conversions = 0;
        revenue = 0;
      }

      await prisma.metric.create({
        data: {
          automationId: automation.id,
          date,
          emailsSent,
          conversions,
          revenue: Math.round(revenue),
        },
      });
    }
  }

  console.log('✨ Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Client 1: client1@example.com / password123');
  console.log('Client 2: client2@example.com / password123');
  console.log('Admin: admin@regista-agency.fr / password123');
  console.log('\n🎯 Automations created:', automations.length);
  console.log('📦 Templates created:', createdTemplates.length);
  console.log('📊 Metrics generated: 30 days x', automations.length, '=', automations.length * 30, 'entries');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n👋 Database connection closed');
  });
