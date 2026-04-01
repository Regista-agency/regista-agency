import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Automation from '@/lib/models/Automation';
import Metric from '@/lib/models/Metric';
import { KPICard } from '@/components/KPICard';
import { MetricsChart } from '@/components/Charts';
import { Mail, TrendingUp, DollarSign, Percent, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  await dbConnect();

  const automation = await Automation.findById(id).lean();

  if (!automation) {
    notFound();
  }

  // Check authorization
  if (
    session?.user.role !== 'admin' &&
    automation.clientId.toString() !== session?.user.clientId
  ) {
    notFound();
  }

  // Get metrics for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const metrics = await Metric.find({
    automationId: automation._id,
    date: { $gte: sevenDaysAgo },
  })
    .sort({ date: 1 })
    .lean();

  // Calculate totals
  const totalEmailsSent = metrics.reduce((sum, m) => sum + m.emailsSent, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
  const conversionRate =
    totalEmailsSent > 0
      ? ((totalConversions / totalEmailsSent) * 100).toFixed(2)
      : '0';

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
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  const conversionsChartData = {
    labels,
    datasets: [
      {
        label: 'Conversions',
        data: metrics.map((m) => m.conversions),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
      {
        label: 'Chiffre d\'affaires (€)',
        data: metrics.map((m) => m.revenue),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
      },
    ],
  };

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

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Emails envoyés"
          value={formatNumber(totalEmailsSent)}
          subtitle="7 derniers jours"
          icon={Mail}
        />
        <KPICard
          title="Conversions"
          value={formatNumber(totalConversions)}
          subtitle="Devis signés"
          icon={TrendingUp}
        />
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(totalRevenue)}
          subtitle="Généré"
          icon={DollarSign}
        />
        <KPICard
          title="Taux de conversion"
          value={`${conversionRate}%`}
          subtitle="Conversions / Emails"
          icon={Percent}
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

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Activité récente</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {metrics.slice(-5).reverse().map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <div className="font-medium">
                    {formatDate(metric.date)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.emailsSent} emails • {metric.conversions}{' '}
                    conversions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(metric.revenue)}
                  </div>
                  <div className="text-sm text-muted-foreground">CA généré</div>
                </div>
              </div>
            ))}
          </div>
          {metrics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune donnée disponible pour les 7 derniers jours
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
