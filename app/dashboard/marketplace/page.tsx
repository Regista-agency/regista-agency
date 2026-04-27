import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { MarketplaceCard, CAT_COLOR, type MarketplaceTemplate } from '@/components/MarketplaceCard';

const CAT_LABEL: Record<string, string> = {
  email:       'Email & Communication',
  crm:         'CRM & Relation Client',
  leads:       'Génération de Leads',
  facturation: 'Facturation',
  scaling:     'Scaling & RH',
  qualite:     'Qualité & Opérations',
  maintenance: 'Maintenance',
};

const CAT_ICON: Record<string, string> = {
  email:       '✉',
  crm:         '🤝',
  leads:       '🎯',
  facturation: '€',
  scaling:     '📈',
  qualite:     '✦',
  maintenance: '🔧',
};

const CAT_ORDER = ['email', 'crm', 'leads', 'facturation', 'scaling', 'qualite', 'maintenance'];

const SOON_CARDS: MarketplaceTemplate[] = [
  {
    _id: 'soon-18',
    number: 18,
    name: 'Onboarding Technicien',
    description:
      'Provisioning automatique Active Directory, déploiement MDM et accès logiciels dès la signature du contrat. Supprime les 1 000€ de perte sèche par nouvelle embauche.',
    category: 'scaling',
    isAdded: false,
    soon: true,
  },
  {
    _id: 'soon-19',
    number: 19,
    name: 'Audio vers Rapport Pro',
    description:
      'Transcrit vos vocaux WhatsApp chantier via Whisper API et génère un rapport d\'intervention structuré dans Praxedo. Réduit les litiges de 50%.',
    category: 'qualite',
    isAdded: false,
    soon: true,
  },
  {
    _id: 'soon-20',
    number: 20,
    name: 'Optimisation CRM',
    description:
      'Synchronise votre ERP Maintenance avec Salesforce ou HubSpot pour des recommandations de vente prédictives basées sur l\'historique d\'intervention. +10% de panier moyen.',
    category: 'crm',
    isAdded: false,
    soon: true,
  },
];

export default async function MarketplacePage() {
  const session = await auth();
  if (!session) redirect('/login');

  const [templates, userAutomations] = await Promise.all([
    prisma.automationTemplate.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    }),
    prisma.automation.findMany({
      where: { clientId: session.user.clientId! },
      select: { templateId: true },
    }),
  ]);

  const addedIds = new Set(
    userAutomations.filter((a) => a.templateId).map((a) => a.templateId!)
  );

  const dbCards: MarketplaceTemplate[] = templates.map((t) => ({
    _id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    isAdded: addedIds.has(t.id),
  }));

  const allCards = [...dbCards, ...SOON_CARDS];

  const byCategory: Record<string, MarketplaceTemplate[]> = {};
  for (const card of allCards) {
    (byCategory[card.category] ??= []).push(card);
  }

  const activeCategories = CAT_ORDER.filter((k) => (byCategory[k]?.length ?? 0) > 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
          Marketplace
        </p>
        <h1 className="text-3xl font-bold text-foreground">Automatisations disponibles</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Activez de nouvelles automatisations pour accélérer votre croissance
        </p>
      </div>

      {activeCategories.length === 0 && (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <p className="text-sm font-semibold text-foreground">Aucune automatisation disponible</p>
          <p className="mt-1 text-xs text-muted-foreground">Revenez plus tard</p>
        </div>
      )}

      <div className="space-y-10">
        {activeCategories.map((catKey) => {
          const color = CAT_COLOR[catKey] ?? '#6b7280';
          const icon  = CAT_ICON[catKey]  ?? '◆';
          const label = CAT_LABEL[catKey] ?? catKey;
          const cards = byCategory[catKey];

          return (
            <section key={catKey}>
              {/* Section header */}
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm"
                  style={{ background: color + '22', color }}
                >
                  {icon}
                </span>
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <div className="ml-1 h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {cards.length} {cards.length > 1 ? 'automatisations' : 'automatisation'}
                </span>
              </div>

              {/* Cards grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((template) => (
                  <MarketplaceCard key={template._id} template={template} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
