'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';

export default function RiskMonitoringPage() {
  const { data } = useQuery({
    queryKey: ['risk-events'],
    queryFn: async () => (await api.get('/api/risk/events')).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Risk Monitoring</h1>
        <p className="mt-1 text-sm text-muted">Live disruption events detected across your supplier network.</p>
      </div>

      <div className="space-y-3">
        {data?.items?.length ? data.items.map((ev: any) => (
          <Card key={ev.id} className="flex items-start justify-between">
            <div>
              <p className="font-medium">{ev.title}</p>
              <p className="mt-1 text-sm text-muted">{ev.description}</p>
              <p className="mt-2 text-xs text-muted font-mono">
                {ev.category} · {ev.country?.name ?? 'Global'} · {new Date(ev.detectedAt).toLocaleDateString()}
              </p>
            </div>
            <span className="rounded-full bg-surface2 px-3 py-1 text-xs font-mono">{ev.severity}</span>
          </Card>
        )) : (
          <Card className="text-center text-muted">No risk events yet. They'll appear here as news is ingested or logged manually.</Card>
        )}
      </div>
    </div>
  );
}
