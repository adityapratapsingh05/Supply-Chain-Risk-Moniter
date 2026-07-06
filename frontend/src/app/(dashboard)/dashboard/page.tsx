'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/input';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const COLORS = ['#2ECC71', '#F5C518', '#F5A623', '#E5484D'];

export default function DashboardPage() {
  const { data: overall } = useQuery({
    queryKey: ['risk-overall'],
    queryFn: async () => (await api.get('/api/risk/overall')).data,
  });
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-summary'],
    queryFn: async () => (await api.get('/api/suppliers?pageSize=100')).data,
  });

  const tierCounts = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((tier) => ({
    name: tier,
    value: suppliers?.items?.filter((s: any) => s.riskTier === tier).length ?? 0,
  }));

  const byCountry = Object.values(
    (suppliers?.items ?? []).reduce((acc: any, s: any) => {
      const key = s.country.name;
      acc[key] = acc[key] || { country: key, risk: 0, count: 0 };
      acc[key].risk += s.riskScore;
      acc[key].count += 1;
      return acc;
    }, {})
  ).map((c: any) => ({ country: c.country, avgRisk: Number((c.risk / c.count).toFixed(1)) }));

  const timeline = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    score: Number((5 + Math.sin(i / 2) * 1.5 + i * 0.1).toFixed(1)),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Command Center</h1>
        <p className="mt-1 text-sm text-muted">Live view of supplier network health and disruption exposure.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardTitle>Active Suppliers</CardTitle>
          <p className="mt-2 font-mono text-3xl font-semibold">{suppliers?.total ?? '—'}</p>
        </Card>
        <Card>
          <CardTitle>Shipments In Transit</CardTitle>
          <p className="mt-2 font-mono text-3xl font-semibold">—</p>
        </Card>
        <Card>
          <CardTitle>Critical Alerts</CardTitle>
          <p className="mt-2 font-mono text-3xl font-semibold text-risk-critical">{overall?.criticalCount ?? 0}</p>
        </Card>
        <Card>
          <CardTitle>Overall Risk Score</CardTitle>
          <div className="mt-2 flex items-center gap-3">
            <p className="font-mono text-3xl font-semibold">{overall?.overallScore ?? '—'}</p>
            {overall?.tier && <Badge tier={overall.tier} />}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={tierCounts} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                {tierCounts.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1B2540', border: '1px solid #26314D', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Average Risk by Country</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCountry}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26314D" />
              <XAxis dataKey="country" tick={{ fill: '#8894B0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8894B0', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1B2540', border: '1px solid #26314D', borderRadius: 8 }} />
              <Bar dataKey="avgRisk" fill="#4F6DF5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Risk Trend (8-Week Timeline)</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26314D" />
              <XAxis dataKey="week" tick={{ fill: '#8894B0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8894B0', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1B2540', border: '1px solid #26314D', borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#4F6DF5" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
