import Link from 'next/link';
import { MarketingNav, MarketingFooter } from '@/components/layout/Marketing';
import { ShieldAlert, Sparkles, Globe2, Truck } from 'lucide-react';

const FEATURES = [
  { icon: ShieldAlert, title: 'Risk scoring, per node', desc: 'Every supplier, port, and lane gets a live risk score built from dependency, criticality, and lead time.' },
  { icon: Sparkles, title: 'AI mitigation plans', desc: 'Claude drafts root-cause analysis, alternative suppliers, and cost estimates the moment risk spikes.' },
  { icon: Globe2, title: 'One global map', desc: 'See every disrupted region, port congestion, and supplier location, color-coded by severity.' },
  { icon: Truck, title: 'Supplier operations', desc: 'Import, export, search, and manage your full supplier roster without leaving the dashboard.' },
];

export default function LandingPage() {
  return (
    <div>
      <MarketingNav />

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accentSoft">Supply chain risk intelligence</p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-tight md:text-6xl">
          See disruption before<br />it reaches your line.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Meridian watches every supplier, port, and shipment in your network and turns raw signals into a
          risk score, a mitigation plan, and a decision — before the disruption hits your production floor.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/signup" className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accentSoft">
            Start monitoring
          </Link>
          <Link href="/features" className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-surface2">
            See how it works
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-surface p-6">
                <Icon className="text-accent" size={22} />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-semibold">Built for operations teams who can't afford surprises.</h2>
        <p className="mt-4 text-muted">Fortune 500 electronics, automotive, and pharma supply chains run on Meridian.</p>
        <Link href="/signup" className="mt-8 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accentSoft">
          Get started free
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
