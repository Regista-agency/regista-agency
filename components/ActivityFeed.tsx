import { cn, formatCurrency } from '@/lib/utils';
import { Mail, CheckCircle, Receipt } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'email' | 'conversion' | 'revenue';
  text: string;
  automationName: string;
  date: Date;
  amount?: number;
}

function relativeDay(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  return `il y a ${days} j`;
}

const TYPE_CONFIG = {
  email: {
    bg: 'bg-blue-500/10',
    color: 'text-blue-500',
    Icon: Mail,
  },
  conversion: {
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-600',
    Icon: CheckCircle,
  },
  revenue: {
    bg: 'bg-amber-500/10',
    color: 'text-amber-600',
    Icon: Receipt,
  },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aucune activité récente
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {items.map((item) => {
        const cfg = TYPE_CONFIG[item.type];
        return (
          <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                cfg.bg
              )}
            >
              <cfg.Icon className={cn('h-3.5 w-3.5', cfg.color)} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-tight">{item.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {item.automationName} · {relativeDay(item.date)}
              </p>
            </div>
            {item.amount != null && item.amount > 0 && (
              <span className="shrink-0 text-sm font-semibold text-emerald-600">
                {formatCurrency(item.amount)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
