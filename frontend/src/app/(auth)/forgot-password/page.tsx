'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
    } finally {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">Enter your email and we'll send a reset link.</p>

        {sent ? (
          <p className="mt-6 text-sm text-risk-low">If that email exists, a reset link is on its way.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-block text-sm text-accentSoft hover:underline">Back to login</Link>
      </Card>
    </div>
  );
}
