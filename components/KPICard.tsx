import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparkLine } from './SparkLine';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  sparkData?: number[];
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, sparkData, className }: KPICardProps) {
  const sparkColor = trend?.positive === false ? '#ef4444' : '#10b981';

  return (
    <div
      className={cn(
        'rounded-lg border bg-card px-5 py-4 transition-shadow hover:shadow-md',
        trend?.positive === true && 'border-emerald-500/30',
        trend?.positive === false && 'border-red-500/30',
        !trend && 'border-border',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="label-caps text-muted-foreground">{title}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
          <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
        </div>
      </div>

      <div className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}

      <div className="mt-3 flex items-end justify-between gap-2">
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              trend.positive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/15 text-red-600 dark:text-red-400'
            )}
          >
            {trend.positive
              ? <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
              : <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
            }
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        ) : (
          <div />
        )}
        {sparkData && sparkData.length >= 2 && (
          <SparkLine data={sparkData} color={sparkColor} width={72} height={28} fill />
        )}
      </div>
    </div>
  );
}
