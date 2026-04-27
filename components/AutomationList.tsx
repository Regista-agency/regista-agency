'use client';

import { useOptimistic, useTransition } from 'react';
import { AutomationCard } from './AutomationCard';
import { toggleAutomation } from '@/app/actions/automation';

interface AutomationItem {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  stats?: { emailsSent: number };
}

export function AutomationsList({ automations }: { automations: AutomationItem[] }) {
  const [optimistic, setOptimistic] = useOptimistic(
    automations,
    (state, { id, active }: { id: string; active: boolean }) =>
      state.map((a) =>
        a._id === id ? { ...a, status: active ? ('active' as const) : ('inactive' as const) } : a
      )
  );
  const [, startTransition] = useTransition();

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      setOptimistic({ id, active });
      await toggleAutomation(id, active);
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {optimistic.map((a) => (
        <AutomationCard
          key={a._id}
          automation={a}
          stats={a.stats}
          onToggle={(active) => handleToggle(a._id, active)}
        />
      ))}
    </div>
  );
}
