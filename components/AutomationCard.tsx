'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';
import { Activity } from 'lucide-react';

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
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{automation.name}</CardTitle>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                      automation.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    <span
                      className={cn(
                        'mr-1.5 h-1.5 w-1.5 rounded-full',
                        automation.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      )}
                    />
                    {automation.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            {automation.description}
          </CardDescription>
          {stats && (
            <div className="rounded-lg bg-muted p-3">
              <div className="text-xs text-muted-foreground">Cette semaine</div>
              <div className="mt-1 text-2xl font-bold">
                {formatNumber(stats.emailsSent)}
              </div>
              <div className="text-xs text-muted-foreground">emails envoyés</div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}