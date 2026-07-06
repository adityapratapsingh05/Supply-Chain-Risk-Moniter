'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

export default function AdminPage() {
  const qc = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/api/admin/users')).data,
  });
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => (await api.get('/api/admin/analytics')).data,
  });
  const { data: logs } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => (await api.get('/api/admin/audit-logs')).data,
  });

  async function changeRole(id: string, role: string) {
    await api.patch(`/api/admin/users/${id}/role`, { role });
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/api/admin/users/${id}`);
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted">Manage users, monitor platform health, and review audit history.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {analytics && Object.entries(analytics).map(([k, v]) => (
          <Card key={k}>
            <p className="text-xs uppercase text-muted">{k.replace(/Count$/, '')}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">{v as any}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <CardHeader className="p-6 pb-0"><CardTitle>Users</CardTitle></CardHeader>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {users?.items?.map((u: any) => (
              <tr key={u.id} className="border-b border-border/50">
                <td className="px-6 py-3 font-medium">{u.name}</td>
                <td className="px-6 py-3 text-muted">{u.email}</td>
                <td className="px-6 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded-lg border border-border bg-surface2 px-2 py-1 text-xs"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-muted">{u.isActive ? 'Active' : 'Disabled'}</td>
                <td className="px-6 py-3">
                  <button onClick={() => deleteUser(u.id)} className="text-muted hover:text-risk-critical">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Audit Logs</CardTitle></CardHeader>
        <div className="space-y-2 font-mono text-xs text-muted">
          {logs?.items?.slice(0, 20).map((l: any) => (
            <p key={l.id}>
              {new Date(l.createdAt).toLocaleString()} — {l.user?.email ?? 'system'} — {l.action}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
