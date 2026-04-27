import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AutomationsList } from '@/components/AutomationsList';
import { KPICard } from '@/components/KPICard';
import { RevenueHero } from '@/components/RevenueHero';
import { ActivityFeed } from '@/components/ActivityFeed';
import type { ActivityItem } from '@/components/ActivityFeed';
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

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const automationIds = automations.map((a) => a.id);

  const [allMetrics, prevMetrics, monthMetrics, prevMonthMetrics, recentMetrics] =
    await Promise.all([
      prisma.metric.findMany({
        where: { automationId: { in: automationIds }, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'asc' },
      }),
      prisma.metric.findMany({
        where: {
          automationId: { in: automationIds },
          date: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      prisma.metric.findMany({
        where: { automationId: { in: automationIds }, date: { gte: monthStart } },
      }),
      prisma.metric.findMany({
        where: {
          automationId: { in: automationIds },
          date: { gte: prevMonthStart, lt: monthStart },
        },
      }),
      prisma.metric.findMany({
        where: { automationId: { in: automationIds } },
        orderBy: { date: 'desc' },
        take: 12,
      }),
    ]);

  // 7-day totals
  const totalEmailsSent = allMetrics.reduce((sum, m) => sum + m.emailsSent, 0);
  const totalConversions = allMetrics.reduce((sum, m) => sum + m.conversions, 0);
  const totalRevenue = allMetrics.reduce((sum, m) => sum + m.revenue, 0);

  const prevEmailsSent = prevMetrics.reduce((sum, m) => sum + m.emailsSent, 0);
  const prevConversions = prevMetrics.reduce((sum, m) => sum + m.conversions, 0);
  const prevRevenue = prevMetrics.reduce((sum, m) => sum + m.revenue, 0);

  function calcTrend(current: number, previous: number) {
    if (previous === 0) return undefined;
    const pct = Math.round(((current - previous) / previous) * 100);
    return { value: Math.abs(pct), positive: pct >= 0 };
  }

  // Monthly revenue hero
  const monthlyRevenue = monthMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const prevMonthlyRevenue = prevMonthMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const revenueTrend =
    prevMonthlyRevenue > 0
      ? Math.round(((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100)
      : null;

  const heroPeriod = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const activeAutomations = automations.filter((a) => a.status === 'active').length;

  // Daily sparklines
  const dailyEmails: number[] = [];
  const dailyConversions: number[] = [];
  const dailyRevenue: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const day = allMetrics.filter((m) => {
      const d = new Date(m.date);
      return d >= dayStart && d <= dayEnd;
    });
    dailyEmails.push(day.reduce((s, m) => s + m.emailsSent, 0));
    dailyConversions.push(day.reduce((s, m) => s + m.conversions, 0));
    dailyRevenue.push(day.reduce((s, m) => s + m.revenue, 0));
  }

  // Activity feed: derive items from recent metric records
  const autoNameById = Object.fromEntries(automations.map((a) => [a.id, a.name]));
  const activityItems: ActivityItem[] = recentMetrics
    .map((m): ActivityItem | null => {
      const autoName = autoNameById[m.automationId] ?? 'Automatisation';
      if (m.conversions > 0) {
        return {
          id: m.id + '_conv',
          type: 'conversion',
          text: `${m.conversions} devis signé${m.conversions > 1 ? 's' : ''}`,
          automationName: autoName,
          date: m.date,
          amount: m.revenue > 0 ? m.revenue : undefined,
        };
      }
      if (m.revenue > 0) {
        return {
          id: m.id + '_rev',
          type: 'revenue',
          text: 'CA généré',
          automationName: autoName,
          date: m.date,
          amount: m.revenue,
        };
      }
      if (m.emailsSent > 0) {
        return {
          id: m.id + '_email',
          type: 'email',
          text: `${m.emailsSent} emails envoyés`,
          automationName: autoName,
          date: m.date,
        };
      }
      return null;
    })
    .filter((item): item is ActivityItem => item !== null)
    .slice(0, 8);

  // Greeting
  const emailUser = session?.user.email?.split('@')[0] ?? '';
  const firstName = emailUser.split(/[._-]/)[0];
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : '';

  // Automations with stats for the list
  const automationsWithStats = await Promise.all(
    automations.map(async (automation) => {
      const metrics = await prisma.metric.findMany({
        where: { automationId: automation.id, date: { gte: sevenDaysAgo } },
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
          {displayName ? `Bonjour, ${displayName} 👋` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble de vos automatisations
        </p>
      </div>

      {/* Revenue Hero */}
      <div className="mb-6">
        <RevenueHero
          revenue={monthlyRevenue}
          trend={revenueTrend}
          sparkData={dailyRevenue.length >= 2 ? dailyRevenue : [0, 0]}
          period={heroPeriod}
          activeAutomations={activeAutomations}
        />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Automatisations"
          value={automations.length}
          subtitle={`${activeAutomations} actives`}
          icon={Zap}
          sparkData={[1, 1, 2, 2, activeAutomations, activeAutomations, automations.length]}
        />
        <KPICard
          title="Emails envoyés"
          value={formatNumber(totalEmailsSent)}
          subtitle="7 derniers jours"
          icon={Mail}
          trend={calcTrend(totalEmailsSent, prevEmailsSent)}
          sparkData={dailyEmails}
        />
        <KPICard
          title="Conversions"
          value={formatNumber(totalConversions)}
          subtitle="7 derniers jours"
          icon={TrendingUp}
          trend={calcTrend(totalConversions, prevConversions)}
          sparkData={dailyConversions}
        />
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(totalRevenue)}
          subtitle="7 derniers jours"
          icon={DollarSign}
          trend={calcTrend(totalRevenue, prevRevenue)}
          sparkData={dailyRevenue}
        />
      </div>

      {/* 2-column: automations + activity feed */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Automations */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Mes automatisations
          </h2>
          {automationsWithStats.length > 0 ? (
            <AutomationsList automations={automationsWithStats} />
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

        {/* Activity Feed */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Activité en direct</h2>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <ActivityFeed items={activityItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
