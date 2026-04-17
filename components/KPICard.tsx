import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card px-5 py-4',
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

      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={cn(
              'font-semibold',
              trend.positive ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-muted-foreground">vs semaine dernière</span>
        </div>
      )}
    </div>
  );
}
