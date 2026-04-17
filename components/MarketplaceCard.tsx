'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketplaceCardProps {
  template: {
    _id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    isAdded: boolean;
  };
}

export function MarketplaceCard({ template }: MarketplaceCardProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(template.isAdded);

  const handleAdd = async () => {
    if (isAdded) return;

    setIsAdding(true);
    try {
      const response = await fetch('/api/marketplace/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template._id }),
      });

      if (response.ok) {
        setIsAdded(true);
        router.refresh();
      } else {
        const data = await response.json();
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
        'flex flex-col rounded-lg border bg-card p-5 transition-all',
        isAdded
          ? 'border-primary/25 bg-accent/40'
          : 'border-border hover:border-primary/30 hover:shadow-sm'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
          <Zap className="h-4 w-4 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground leading-tight">
            {template.name}
          </h3>
          <span className="label-caps text-muted-foreground capitalize">
            {template.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {template.description}
      </p>

      {/* Action */}
      <Button
        onClick={handleAdd}
        disabled={isAdding || isAdded}
        variant={isAdded ? 'secondary' : 'default'}
        size="sm"
        className="w-full"
      >
        {isAdded ? (
          <>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Ajoutée
          </>
        ) : (
          <>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {isAdding ? 'Ajout…' : 'Ajouter'}
          </>
        )}
      </Button>
    </div>
  );
}
