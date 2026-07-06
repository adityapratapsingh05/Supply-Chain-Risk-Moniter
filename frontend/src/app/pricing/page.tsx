import Link from 'next/link';
import { MarketingNav, MarketingFooter } from '@/components/layout/Marketing';
import { Check } from 'lucide-react';

const PLANS = [
  { name: 'Starter', price: '$0', desc: 'For small teams getting started', features: ['Up to 15 suppliers', 'Manual risk scoring', 'Email alerts'] },
  { name: 'Growth', price: '$499/mo', desc: 'For growing operations teams', highlighted: true, features: ['Up to 250 suppliers', 'AI mitigation plans', 'Global map & analytics', 'CSV/Excel import-export'] },
  { name: 'Enterprise', price: 'Custom', desc: 'For global supply chains', features: ['Unlimited suppliers', 'Dedicated news ingestion', 'SSO & role-based access', 'Priority support'] },
];

export default function PricingPage() {
  return (
    <div>
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold">Simple, transparent pricing</h1>
          <p className="mt-4 text-muted">Start free. Upgrade when your network grows.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-8 ${plan.highlighted ? 'border-accent bg-surface' : 'border-border bg-surface/60'}`}>
              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-sm text-muted">{plan.desc}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-muted"><Check size={14} className="text-accent" /> {f}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block rounded-xl bg-accent py-2.5 text-center text-sm font-medium text-white hover:bg-accentSoft">
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
