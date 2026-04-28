'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CAT_COLOR: Record<string, string> = {
  email:       '#3b82f6',
  crm:         '#8b5cf6',
  facturation: '#f59e0b',
  leads:       '#10b981',
  scaling:     '#f97316',
  qualite:     '#06b6d4',
  maintenance: '#6b7280',
};

export interface MarketplaceTemplate {
  _id: string;
  number?: number;
  name: string;
  description: string;
  category: string;
  isAdded: boolean;
  soon?: boolean;
}

interface MarketplaceCardProps {
  template: MarketplaceTemplate;
}

export function MarketplaceCard({ template }: MarketplaceCardProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(template.isAdded);

  const accent = CAT_COLOR[template.category] ?? '#6b7280';

  const handleAdd = async () => {
    if (isAdded || template.soon) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/marketplace/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template._id }),
      });
      if (res.ok) {
        setIsAdded(true);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'ajout");
      }
    } catch {
      alert("Erreur lors de l'ajout");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card p-5 transition-all duration-200 overflow-hidden',
        template.soon
          ? 'border-border'
          : isAdded
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-border hover:shadow-md'
      )}
      style={
        !template.soon && !isAdded
          ? ({ '--accent': accent } as React.CSSProperties)
          : undefined
      }
    >
      {/* Gold hover border overlay */}
      {!template.soon && !isAdded && (
        <span
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-inset transition-opacity duration-200 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px var(--color-primary, #C49A3C)` }}
        />
      )}

      {/* Soon ribbon */}
      {template.soon && (
        <div className="absolute right-0 top-0 h-[4.5rem] w-[4.5rem] overflow-hidden pointer-events-none">
          <span className="absolute right-[-1.6rem] top-[1.1rem] rotate-45 bg-amber-500 px-7 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">
            Bientôt
          </span>
        </div>
      )}

      {/* Card number */}
      {template.number !== undefined && (
        <span className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          #{String(template.number).padStart(2, '0')}
        </span>
      )}

      {/* Accent bar */}
      <div className="mb-4 h-0.5 w-8 rounded-full" style={{ background: accent }} />

      {/* Name */}
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
        {template.name}
      </h3>

      {/* Description */}
      <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {template.description}
      </p>

      {/* Action */}
      {template.soon ? (
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          Disponible prochainement
        </div>
      ) : isAdded ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
          Ajoutée à votre compte
        </div>
      ) : (
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {isAdding ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Activation…
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Activer l&apos;automatisation
            </>
          )}
        </button>
      )}
    </div>
  );
}
