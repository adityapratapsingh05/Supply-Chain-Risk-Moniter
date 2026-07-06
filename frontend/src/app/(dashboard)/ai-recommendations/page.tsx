'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function AiRecommendationsPage() {
  const [generating, setGenerating] = useState(false);
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: async () => (await api.get('/api/suppliers?pageSize=100')).data,
  });
  const { data: recs, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => (await api.get('/api/ai/recommendations')).data,
  });
  const [selected, setSelected] = useState('');

  async function generate() {
    if (!selected) return;
    setGenerating(true);
    try {
      await api.post('/api/ai/mitigation', { supplierId: selected });
      await refetch();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">AI Recommendation Center</h1>
        <p className="mt-1 text-sm text-muted">Generate mitigation plans, alternative suppliers, and cost estimates powered by Claude.</p>
      </div>

      <Card>
        <div className="flex gap-3">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-11 flex-1 rounded-xl border border-border bg-surface2 px-4 text-sm">
            <option value="">Select a supplier...</option>
            {suppliers?.items?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} — {s.riskTier}</option>
            ))}
          </select>
          <Button onClick={generate} disabled={!selected || generating}>
            <Sparkles size={16} /> {generating ? 'Analyzing...' : 'Generate Plan'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {recs?.items?.map((r: any) => (
          <Card key={r.id}>
            <CardHeader><CardTitle>{r.supplier?.name ?? 'Recommendation'}</CardTitle></CardHeader>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted">Root cause: </span>{r.rootCause || '—'}</p>
              <p><span className="text-muted">Mitigation: </span>{r.mitigationPlan || '—'}</p>
              <p><span className="text-muted">Inventory strategy: </span>{r.inventoryStrategy || '—'}</p>
              <p><span className="text-muted">Cost estimate: </span>{r.costEstimateUsd ? `$${Number(r.costEstimateUsd).toLocaleString()}` : '—'}</p>
              <p><span className="text-muted">Recovery time: </span>{r.recoveryTimeDays ? `${r.recoveryTimeDays} days` : '—'}</p>
              <p><span className="text-muted">Confidence: </span>{r.confidenceScore ? `${Math.round(r.confidenceScore * 100)}%` : '—'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
