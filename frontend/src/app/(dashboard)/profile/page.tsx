'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted">Your account details.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Full name</label>
            <Input defaultValue={user?.name} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Email</label>
            <Input defaultValue={user?.email} disabled />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Role</label>
            <Input defaultValue={user?.role} disabled />
          </div>
          <Button>Save changes</Button>
        </div>
      </Card>
    </div>
  );
}
