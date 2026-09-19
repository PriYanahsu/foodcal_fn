import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

/** Footer shared by the public pages (landing, privacy, terms). */
export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-canvas-2">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-muted">Track your nutrition instantly with AI</p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label="Legal" className="flex gap-6 text-sm font-semibold text-fg-2">
            <Link href="/privacy" className="hover:text-fg">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-fg">
              Terms of service
            </Link>
          </nav>
          <p className="text-xs text-muted">© 2026 FoodCal</p>
        </div>
      </div>
    </footer>
  );
}
