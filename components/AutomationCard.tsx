'use client';

import Link from 'next/link';
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
}

export function AutomationCard({ automation, stats }: AutomationCardProps) {
  return (
    <Link href={`/dashboard/automations/${automation._id}`}>
      <div className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">

        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
              <Zap className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {automation.name}
              </h3>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1 label-caps',
                  automation.status === 'active'
                    ? 'text-emerald-600'
                    : 'text-muted-foreground'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    automation.status === 'active' ? 'bg-emerald-500' : 'bg-border'
                  )}
                />
                {automation.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {automation.description}
        </p>

        {/* Stats */}
        {stats && (
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
    </Link>
  );
}
