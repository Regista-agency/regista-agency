'use client';

import { useRouter } from 'next/navigation';
import { cn, formatNumber } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface AutomationCardProps {
  automation: {
    _id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive';
  };
  stats?: {
    emailsSent: number;
  };
  onToggle?: (active: boolean) => void;
}

export function AutomationCard({ automation, stats, onToggle }: AutomationCardProps) {
  const router = useRouter();
  const isActive = automation.status === 'active';

  return (
    <div
      className="group rounded-lg border border-border bg-card p-5 cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm"
      onClick={() => router.push(`/dashboard/automations/${automation._id}`)}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
            <Zap className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
              {automation.name}
            </h3>
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1 label-caps',
                isActive ? 'text-emerald-600' : 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isActive ? 'bg-emerald-500' : 'bg-border'
                )}
              />
              {isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Toggle switch */}
        {onToggle && (
          <button
            role="switch"
            aria-checked={isActive}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(!isActive);
            }}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive ? 'bg-emerald-500' : 'bg-border'
            )}
          >
            <span
              className={cn(
                'absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                isActive ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {automation.description}
      </p>

      {/* Stats */}
      {stats && isActive && (
        <div className="rounded-md border border-border bg-secondary/60 px-3 py-2.5">
          <p className="label-caps text-muted-foreground mb-0.5">Cette semaine</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            {formatNumber(stats.emailsSent)}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              emails envoyés
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
