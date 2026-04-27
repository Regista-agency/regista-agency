import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { KPICard } from '@/components/KPICard';
import { MetricsChart } from '@/components/Charts';
import { ActivityFeed } from '@/components/ActivityFeed';
import type { ActivityItem } from '@/components/ActivityFeed';
import { DropZone } from '@/components/DropZone';
import { Mail, TrendingUp, DollarSign, Percent, ArrowLeft, Settings } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import path from 'path';
import { readdir, stat } from 'fs/promises';

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const automation = await prisma.automation.findUnique({
    where: { id },
  });

  if (!automation) {
    notFound();
  }

  // Check authorization
  if (
    session?.user.role !== 'admin' &&
    automation.clientId !== session?.user.clientId
  ) {
    notFound();
  }

  // Get metrics for last 7 days and previous 7 days (for trend)
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const [metrics, prevMetrics] = await Promise.all([
    prisma.metric.findMany({
      where: { automationId: automation.id, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' },
    }),
    prisma.metric.findMany({
      where: { automationId: automation.id, date: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
  ]);

  // Calculate totals
  const totalEmailsSent = metrics.reduce((sum, m) => sum + m.emailsSent, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
  const conversionRate =
    totalEmailsSent > 0
      ? ((totalConversions / totalEmailsSent) * 100).toFixed(2)
      : '0';

  const prevEmailsSent = prevMetrics.reduce((sum, m) => sum + m.emailsSent, 0);
  const prevConversions = prevMetrics.reduce((sum, m) => sum + m.conversions, 0);
  const prevRevenue = prevMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const prevConversionRate = prevEmailsSent > 0 ? (prevConversions / prevEmailsSent) * 100 : 0;

  function calcTrend(current: number, previous: number) {
    if (previous === 0) return undefined;
    const pct = Math.round(((current - previous) / previous) * 100);
    return { value: Math.abs(pct), positive: pct >= 0 };
  }

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
    const day = metrics.filter((m) => {
      const d = new Date(m.date);
      return d >= dayStart && d <= dayEnd;
    });
    dailyEmails.push(day.reduce((s, m) => s + m.emailsSent, 0));
    dailyConversions.push(day.reduce((s, m) => s + m.conversions, 0));
    dailyRevenue.push(day.reduce((s, m) => s + m.revenue, 0));
  }

  // Prepare chart data
  const labels = metrics.map((m) =>
    new Date(m.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    })
  );

  const emailsChartData = {
    labels,
    datasets: [
      {
        label: 'Emails envoyés',
        data: metrics.map((m) => m.emailsSent),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  // Normalize revenue to the same visual scale as conversions for the combined chart
  const maxConv = Math.max(...metrics.map((m) => m.conversions), 1);
  const maxRev = Math.max(...metrics.map((m) => m.revenue), 1);
  const revenueScale = maxRev / maxConv;

  const conversionsChartData = {
    labels,
    datasets: [
      {
        label: 'Conversions',
        data: metrics.map((m) => m.conversions),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'CA (€)',
        data: metrics.map((m) => m.revenue / revenueScale),
        borderColor: '#C49A3C',
        backgroundColor: 'rgba(196, 154, 60, 0.1)',
        format: 'currency' as const,
        scale: revenueScale,
      },
    ],
  };

  // Derive ActivityItem[] from this automation's recent metrics
  const activityItems: ActivityItem[] = metrics
    .slice()
    .reverse()
    .flatMap((m): ActivityItem[] => {
      const items: ActivityItem[] = [];
      if (m.conversions > 0) {
        items.push({
          id: m.id + '_conv',
          type: 'conversion',
          text: `${m.conversions} devis signé${m.conversions > 1 ? 's' : ''}`,
          automationName: automation.name,
          date: m.date,
          amount: m.revenue > 0 ? m.revenue : undefined,
        });
      } else if (m.revenue > 0) {
        items.push({
          id: m.id + '_rev',
          type: 'revenue',
          text: 'CA généré',
          automationName: automation.name,
          date: m.date,
          amount: m.revenue,
        });
      } else if (m.emailsSent > 0) {
        items.push({
          id: m.id + '_email',
          type: 'email',
          text: `${m.emailsSent} emails envoyés`,
          automationName: automation.name,
          date: m.date,
        });
      }
      return items;
    })
    .slice(0, 8);

  // List already-uploaded files for this automation
  const uploadsDir = path.join(process.cwd(), 'uploads', id);
  let existingFiles: { name: string; size: number }[] = [];
  try {
    const names = await readdir(uploadsDir);
    existingFiles = await Promise.all(
      names.map(async (name) => {
        const s = await stat(path.join(uploadsDir, name));
        return { name, size: s.size };
      })
    );
  } catch {
    // no uploads yet
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dashboard
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{automation.name}</h1>
            <p className="text-muted-foreground mt-2">
              {automation.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/automations/${id}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            </Link>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                automation.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${
                  automation.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              {automation.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
          subtitle="Devis signés"
          icon={TrendingUp}
          trend={calcTrend(totalConversions, prevConversions)}
          sparkData={dailyConversions}
        />
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(totalRevenue)}
          subtitle="Généré"
          icon={DollarSign}
          trend={calcTrend(totalRevenue, prevRevenue)}
          sparkData={dailyRevenue}
        />
        <KPICard
          title="Taux de conversion"
          value={`${conversionRate}%`}
          subtitle="Conversions / Emails"
          icon={Percent}
          trend={calcTrend(parseFloat(conversionRate), prevConversionRate)}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <MetricsChart
          title="Évolution des emails envoyés"
          data={emailsChartData}
        />
        <MetricsChart
          title="Conversions et Chiffre d'affaires"
          data={conversionsChartData}
        />
      </div>

      {/* Bottom row: activity feed + file import */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Activité récente */}
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Activité récente</h2>
          <ActivityFeed items={activityItems} />
        </div>

        {/* Import de données */}
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Import de données</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Importez un modèle de facture pour l&apos;utiliser dans ce workflow
          </p>
          <DropZone automationId={id} existingFiles={existingFiles} />
        </div>

      </div>
    </div>
  );
}