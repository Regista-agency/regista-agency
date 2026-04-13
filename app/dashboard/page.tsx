import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AutomationCard } from '@/components/AutomationCard';
import { KPICard } from '@/components/KPICard';
import { Activity, Mail, TrendingUp, DollarSign } from 'lucide-react';
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

  // Calculate global stats (last 7 days)
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de vos automatisations
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Automatisations"
          value={automations.length}
          subtitle={`${automations.filter((a) => a.status === 'active').length} actives`}
          icon={Activity}
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

      {/* Automations List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mes Automatisations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {automationsWithStats.map((automation) => (
            <AutomationCard
              key={automation._id}
              automation={automation}
              stats={automation.stats}
            />
          ))}
        </div>
      </div>

      {automations.length === 0 && (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Aucune automatisation</h3>
          <p className="text-muted-foreground mt-2">
            Vos automatisations apparaîtront ici
          </p>
        </div>
      )}
    </div>
  );
}
