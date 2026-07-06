'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(true);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your appearance and notification preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <div className="flex gap-3">
          <Button variant={theme === 'dark' ? 'primary' : 'outline'} onClick={() => setTheme('dark')}>Dark Mode</Button>
          <Button variant={theme === 'light' ? 'primary' : 'outline'} onClick={() => setTheme('light')}>Light Mode</Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm">
            Email alerts
            <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between text-sm">
            Browser alerts
            <input type="checkbox" checked={browserAlerts} onChange={(e) => setBrowserAlerts(e.target.checked)} />
          </label>
        </div>
      </Card>
    </div>
  );
}
