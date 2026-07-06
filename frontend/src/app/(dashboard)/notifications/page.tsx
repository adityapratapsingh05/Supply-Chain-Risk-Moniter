'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/api/notifications')).data,
  });

  async function markAllRead() {
    await api.patch('/api/notifications/read-all');
    qc.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function markRead(id: string) {
    await api.patch(`/api/notifications/${id}/read`);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-muted">{data?.unreadCount ?? 0} unread</p>
        </div>
        <Button variant="outline" onClick={markAllRead}><CheckCheck size={16} /> Mark all read</Button>
      </div>

      <div className="space-y-2">
        {data?.items?.length ? data.items.map((n: any) => (
          <Card
            key={n.id}
            onClick={() => !n.isRead && markRead(n.id)}
            className={`flex cursor-pointer items-start gap-3 ${!n.isRead ? 'border-accent/40' : ''}`}
          >
            <Bell size={18} className={!n.isRead ? 'text-accent' : 'text-muted'} />
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted">{n.message}</p>
              <p className="mt-1 text-xs font-mono text-muted">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </Card>
        )) : (
          <Card className="text-center text-muted">You're all caught up. New alerts will show up here.</Card>
        )}
      </div>
    </div>
  );
}
