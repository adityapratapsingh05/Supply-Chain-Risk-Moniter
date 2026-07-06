'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';

function VerifyBody() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    api.post('/api/auth/verify-email', { token })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <Card className="w-full max-w-md text-center">
      {status === 'loading' && <p className="text-sm text-muted">Verifying your email...</p>}
      {status === 'ok' && (
        <>
          <h1 className="font-display text-xl font-semibold text-risk-low">Email verified</h1>
          <Link href="/login" className="mt-4 inline-block text-sm text-accentSoft hover:underline">Continue to login</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="font-display text-xl font-semibold text-risk-critical">Link invalid or expired</h1>
          <Link href="/signup" className="mt-4 inline-block text-sm text-accentSoft hover:underline">Back to signup</Link>
        </>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <Suspense fallback={null}>
        <VerifyBody />
      </Suspense>
    </div>
  );
}
