'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsPage() {
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-analytics'],
    queryFn: async () => (await api.get('/api/suppliers?pageSize=100')).data,
  });

  const byTier = Array.from({ length: 3 }, (_, i) => i + 1).map((tier) => ({
    tier: `Tier ${tier}`,
    count: suppliers?.items?.filter((s: any) => s.tier === tier).length ?? 0,
    avgLeadTime: Math.round(
      (suppliers?.items?.filter((s: any) => s.tier === tier).reduce((a: number, s: any) => a + s.leadTimeDays, 0) ?? 0) /
      (suppliers?.items?.filter((s: any) => s.tier === tier).length || 1)
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Deeper cuts of your supplier network performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Suppliers by Tier</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byTier}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26314D" />
              <XAxis dataKey="tier" tick={{ fill: '#8894B0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8894B0', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1B2540', border: '1px solid #26314D', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#4F6DF5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average Lead Time by Tier (days)</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byTier}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26314D" />
              <XAxis dataKey="tier" tick={{ fill: '#8894B0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8894B0', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1B2540', border: '1px solid #26314D', borderRadius: 8 }} />
              <Bar dataKey="avgLeadTime" fill="#F5A623" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
