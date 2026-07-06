'use client';

import { useState } from 'react';
import { MarketingNav, MarketingFooter } from '@/components/layout/Marketing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <MarketingNav />
      <section className="mx-auto max-w-xl px-6 py-24">
        <h1 className="font-display text-4xl font-semibold">Talk to us</h1>
        <p className="mt-4 text-muted">Questions about Meridian? Send us a note and we'll get back within a day.</p>

        {sent ? (
          <p className="mt-8 text-risk-low">Thanks — we'll be in touch shortly.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-8 space-y-4">
            <Input placeholder="Your name" required />
            <Input type="email" placeholder="Work email" required />
            <textarea
              required
              placeholder="How can we help?"
              rows={5}
              className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm placeholder:text-muted focus-ring"
            />
            <Button type="submit" className="w-full">Send message</Button>
          </form>
        )}
      </section>
      <MarketingFooter />
    </div>
  );
}
