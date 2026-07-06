'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Truck, ShieldAlert, Sparkles, Globe2, BarChart3,
  Settings, Bell, ShieldCheck, User, LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/risk-monitoring', label: 'Risk Monitoring', icon: ShieldAlert },
  { href: '/ai-recommendations', label: 'AI Recommendations', icon: Sparkles },
  { href: '/global-map', label: 'Global Map', icon: Globe2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface px-4 py-6">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-lg bg-accent" />
        <span className="font-display text-lg font-semibold">Meridian</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink',
              pathname === href && 'bg-surface2 text-ink'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink',
              pathname === '/admin' && 'bg-surface2 text-ink'
            )}
          >
            <ShieldCheck size={18} />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-sm font-semibold">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface2 hover:text-risk-critical"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
