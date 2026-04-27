'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, LogOut, Zap, ShoppingBag, Settings, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

interface SidebarProps {
  automations: Array<{
    _id: string;
    name: string;
    status: string;
  }>;
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

export function Sidebar({ automations }: SidebarProps) {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">

      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-700 tracking-tight text-foreground">
          Regista
        </span>
        <span className="ml-0.5 label-caps text-muted-foreground">Agency</span>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-accent text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Automatisations */}
        {automations.length > 0 && (
          <div>
            <p className="label-caps mb-2 px-3 text-muted-foreground">
              Automatisations
            </p>
            <div className="space-y-0.5">
              {automations.map((automation) => {
                const active = pathname === `/dashboard/automations/${automation._id}`;
                return (
                  <Link
                    key={automation._id}
                    href={`/dashboard/automations/${automation._id}`}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-accent text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <span className="truncate">{automation.name}</span>
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        automation.status === 'active' ? 'bg-emerald-500' : 'bg-border'
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Pied de sidebar */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <span className="flex items-center gap-2.5">
            {dark ? (
              <Sun className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            ) : (
              <Moon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            )}
            {dark ? 'Mode clair' : 'Mode sombre'}
          </span>
          {/* Toggle track */}
          <span
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
              dark ? 'bg-primary' : 'bg-border'
            )}
          >
            <span
              className={cn(
                'absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                dark ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </span>
        </button>

        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-accent text-primary font-medium'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Paramètres
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
