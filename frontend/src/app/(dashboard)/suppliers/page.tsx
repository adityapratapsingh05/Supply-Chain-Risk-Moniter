'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input, Badge } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Upload, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SuppliersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['suppliers', search, tier, page],
    queryFn: async () =>
      (await api.get('/api/suppliers', { params: { search, tier, page, pageSize: 10 } })).data,
  });

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    await api.post('/api/suppliers/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    qc.invalidateQueries({ queryKey: ['suppliers'] });
  }

  async function handleExport() {
    const res = await api.get('/api/suppliers/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = 'suppliers.xlsx'; a.click();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this supplier?')) return;
    await api.delete(`/api/suppliers/${id}`);
    qc.invalidateQueries({ queryKey: ['suppliers'] });
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Suppliers</h1>
          <p className="mt-1 text-sm text-muted">{data?.total ?? 0} suppliers across your network.</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleImport} />
              <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-surface2">
                <Upload size={16} /> Import
              </span>
            </label>
            <Button variant="outline" onClick={handleExport}><Download size={16} /> Export</Button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Search suppliers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="h-11 rounded-xl border border-border bg-surface2 px-4 text-sm"
        >
          <option value="">All tiers</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Country</th>
              <th className="px-6 py-3 font-medium">Tier</th>
              <th className="px-6 py-3 font-medium">Lead Time</th>
              <th className="px-6 py-3 font-medium">Risk Score</th>
              <th className="px-6 py-3 font-medium">Status</th>
              {canEdit && <th className="px-6 py-3" />}
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((s: any) => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-surface2/50">
                <td className="px-6 py-3 font-medium">{s.name}</td>
                <td className="px-6 py-3 text-muted">{s.country.name}</td>
                <td className="px-6 py-3 text-muted">Tier {s.tier}</td>
                <td className="px-6 py-3 font-mono text-muted">{s.leadTimeDays}d</td>
                <td className="px-6 py-3 font-mono">{s.riskScore.toFixed(1)}</td>
                <td className="px-6 py-3"><Badge tier={s.riskTier} /></td>
                {canEdit && (
                  <td className="px-6 py-3">
                    <button onClick={() => handleDelete(s.id)} className="text-muted hover:text-risk-critical">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
