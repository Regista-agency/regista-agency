'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  automations: Array<{
    _id: string;
    name: string;
    status: string;
  }>;
}

export function Sidebar({ automations }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="border-b p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">Regista</span>
            <span className="text-xs text-muted-foreground">Agency</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
            Automatisations
          </h3>
          <div className="space-y-1">
            {automations.map((automation) => (
              <Link
                key={automation._id}
                href={`/dashboard/automations/${automation._id}`}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === `/dashboard/automations/${automation._id}`
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="truncate">{automation.name}</span>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    automation.status === 'active'
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  )}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}