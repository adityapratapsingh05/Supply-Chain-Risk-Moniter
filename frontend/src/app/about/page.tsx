import { MarketingNav, MarketingFooter } from '@/components/layout/Marketing';

export default function AboutPage() {
  return (
    <div>
      <MarketingNav />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-semibold">About Meridian</h1>
        <p className="mt-6 text-muted">
          Meridian was built for supply chain and procurement teams who need to see risk before it becomes
          a line-down event. We combine live news signal, supplier network data, and AI-driven analysis into
          a single command center — so decisions happen in hours, not weeks.
        </p>
        <p className="mt-4 text-muted">
          Our team has run risk operations for electronics, automotive, and pharmaceutical supply chains,
          and built Meridian to be the tool we always wished we had.
        </p>
      </section>
      <MarketingFooter />
    </div>
  );
}
