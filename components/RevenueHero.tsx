'use client';

import { useEffect, useState } from 'react';
import { SparkLine } from './SparkLine';

interface RevenueHeroProps {
  revenue: number;
  trend?: number | null;
  sparkData: number[];
  period: string;
  activeAutomations: number;
}

export function RevenueHero({ revenue, trend, sparkData, period, activeAutomations }: RevenueHeroProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame = 0;
    const steps = 70;
    const id = setInterval(() => {
      frame++;
      const ease = 1 - Math.pow(1 - frame / steps, 3);
      setDisplayed(Math.round(ease * revenue));
      if (frame >= steps) {
        setDisplayed(revenue);
        clearInterval(id);
      }
    }, 1600 / steps);
    return () => clearInterval(id);
  }, [revenue]);

  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayed);

  return (
    <div
      className="rounded-lg px-7 py-6 flex items-center justify-between gap-6"
      style={{ background: 'linear-gradient(135deg, #1E2025 0%, #2D3139 100%)' }}
    >
      <div>
        <div
          className="text-xs font-bold uppercase mb-2"
          style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em' }}
        >
          Chiffre d&apos;affaires — {period}
        </div>
        <div className="text-4xl font-extrabold tracking-tight leading-none" style={{ color: '#fff' }}>
          {formatted}
        </div>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {trend != null && (
            <>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                style={{
                  background: trend >= 0 ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
                  color: trend >= 0 ? '#34d399' : '#f87171',
                }}
              >
                {trend >= 0 ? '↑' : '↓'} {trend >= 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>vs mois dernier</span>
              <span className="text-xs mx-1" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            </>
          )}
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {activeAutomations} automatisation{activeAutomations !== 1 ? 's' : ''} active{activeAutomations !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div style={{ opacity: 0.9, flexShrink: 0 }}>
        <SparkLine data={sparkData} color="#C49A3C" width={130} height={60} fill />
      </div>
    </div>
  );
}
