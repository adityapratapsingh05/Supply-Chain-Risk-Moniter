'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted">Loading...</div>;
  }
  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-y-auto bg-base p-8">{children}</main>
    </div>
  );
}
