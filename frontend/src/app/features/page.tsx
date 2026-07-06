import { MarketingNav, MarketingFooter } from '@/components/layout/Marketing';
import { ShieldAlert, Sparkles, Globe2, Truck, Bell, BarChart3, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: ShieldAlert, title: 'Real-time risk monitoring', desc: 'Every risk event — geopolitical, weather, labor, financial — lands on your dashboard as it happens.' },
  { icon: Sparkles, title: 'AI recommendation engine', desc: 'Claude generates root cause, business impact, alternative suppliers, and a costed mitigation plan.' },
  { icon: Globe2, title: 'Global risk map', desc: 'Suppliers, ports, and disrupted regions plotted on one interactive world map, color-coded by severity.' },
  { icon: Truck, title: 'Supplier management', desc: 'Full CRUD, CSV/Excel import and export, search, filters, and pagination for your whole roster.' },
  { icon: BarChart3, title: 'Analytics & dashboards', desc: 'Pie, bar, line, and heatmap views of your network health, trended over time.' },
  { icon: Bell, title: 'Multi-channel notifications', desc: 'Email, browser, and in-dashboard alerts the moment a supplier crosses your risk threshold.' },
  { icon: ShieldCheck, title: 'Role-based access', desc: 'Admin, Manager, and Viewer roles keep sensitive supplier and cost data need-to-know.' },
];

export default function FeaturesPage() {
  return (
    <div>
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="font-display text-4xl font-semibold">Everything your risk team needs, in one place.</h1>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <Icon className="text-accent" size={22} />
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
