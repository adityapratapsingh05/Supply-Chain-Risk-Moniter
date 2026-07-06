'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/signup', { name, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-4">
        <Card className="w-full max-w-md text-center">
          <h1 className="font-display text-xl font-semibold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted">We sent a verification link to {email}. Confirm it to activate your account.</p>
          <Link href="/login" className="mt-6 inline-block text-sm text-accentSoft hover:underline">Back to login</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Start monitoring your supply chain risk today.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Full name</label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Cooper" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Password</label>
            <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          {error && <p className="text-sm text-risk-critical">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="text-accentSoft hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
