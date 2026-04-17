import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AutomationCard } from '@/components/AutomationCard';
import { KPICard } from '@/components/KPICard';
import { Zap, Mail, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();

  const query =
    session?.user.role === 'admin'
      ? {}
      : { clientId: session?.user.clientId! };

  const automations = await prisma.automation.findMany({
    where: query,
    orderBy: { createdAt: 'desc' },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const allMetrics = await prisma.metric.findMany({
    where: {
      automationId: { in: automations.map((a) => a.id) },
      date: { gte: sevenDaysAgo },
    },
  });

  const totalEmailsSent = allMetrics.reduce((sum, m) => sum + m.emailsSent, 0);
  const totalConversions = allMetrics.reduce((sum, m) => sum + m.conversions, 0);
  const totalRevenue = allMetrics.reduce((sum, m) => sum + m.revenue, 0);

  const automationsWithStats = await Promise.all(
    automations.map(async (automation) => {
      const metrics = await prisma.metric.findMany({
        where: {
          automationId: automation.id,
          date: { gte: sevenDaysAgo },
        },
      });

      const emailsSent = metrics.reduce((sum, m) => sum + m.emailsSent, 0);

      return {
        _id: automation.id,
        name: automation.name,
        description: automation.description,
        status: automation.status as 'active' | 'inactive',
        stats: { emailsSent },
      };
    })
  );

  return (
    <div className="px-8 py-8">

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d'ensemble de vos automatisations
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Automatisations"
          value={automations.length}
          subtitle={`${automations.filter((a) => a.status === 'active').length} actives`}
          icon={Zap}
        />
        <KPICard
          title="Emails envoyés"
          value={formatNumber(totalEmailsSent)}
          subtitle="7 derniers jours"
          icon={Mail}
        />
        <KPICard
          title="Conversions"
          value={formatNumber(totalConversions)}
          subtitle="7 derniers jours"
          icon={TrendingUp}
        />
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(totalRevenue)}
          subtitle="7 derniers jours"
          icon={DollarSign}
        />
      </div>

      {/* Liste des automatisations */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Mes automatisations
        </h2>

        {automationsWithStats.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {automationsWithStats.map((automation) => (
              <AutomationCard
                key={automation._id}
                automation={automation}
                stats={automation.stats}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Zap className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Aucune automatisation
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vos automatisations apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
