import Link from 'next/link';

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-base/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent" />
          <span className="font-display text-lg font-semibold">Meridian</span>
        </Link>
        <nav className="hidden gap-8 text-sm text-muted md:flex">
          <Link href="/features" className="hover:text-ink">Features</Link>
          <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/about" className="hover:text-ink">About</Link>
          <Link href="/contact" className="hover:text-ink">Contact</Link>
        </nav>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-ink hover:bg-surface2">Log in</Link>
          <Link href="/signup" className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accentSoft">Get started</Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted md:flex-row">
        <p>© {new Date().getFullYear()} Meridian. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-ink">About</Link>
          <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/contact" className="hover:text-ink">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
