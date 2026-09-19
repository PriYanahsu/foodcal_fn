import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { LandingNav } from '@/features/landing/components/LandingNav';
import { LandingFooter } from '@/features/landing/components/LandingFooter';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalPageProps {
  kind: 'privacy' | 'terms';
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

const OTHER_DOC = {
  privacy: { href: '/terms', label: 'Terms of service', icon: DocumentTextIcon },
  terms: { href: '/privacy', label: 'Privacy policy', icon: ShieldCheckIcon },
};

/**
 * Public legal page (privacy / terms): landing header and footer, a sticky
 * table of contents on desktop, and a readable 680px text column.
 */
export function LegalPage({ kind, title, lastUpdated, sections }: LegalPageProps) {
  const other = OTHER_DOC[kind];
  const OtherIcon = other.icon;

  return (
    <div className="min-h-screen bg-canvas font-ui text-fg antialiased selection:bg-brand selection:text-on-brand">
      <LandingNav current={kind === 'privacy' ? 'privacy' : undefined} />

      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-10 md:px-8 md:py-14 lg:grid-cols-[220px_minmax(0,680px)] lg:justify-center lg:gap-16">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-28 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">On this page</p>
            <ul className="flex flex-col border-l border-line">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-3 text-sm text-fg-2 transition-colors hover:border-brand hover:text-fg"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-line pt-4">
              <Link
                href={other.href}
                className="inline-flex items-center gap-2 text-sm font-bold text-fg-2 hover:text-fg"
              >
                <OtherIcon className="h-4 w-4" />
                {other.label}
              </Link>
            </div>
          </nav>
        </aside>

        <main className="min-w-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-fg-2 hover:text-fg"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to home
          </Link>

          <header className="mt-6 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-ink">Legal</p>
            <h1 className="font-display text-[36px] font-bold leading-tight tracking-[-0.02em] text-fg md:text-[44px]">
              {title}
            </h1>
            <p className="text-sm text-muted">Last updated {lastUpdated}</p>
          </header>

          {/* Phones and tablets: contents as a compact card instead of a sidebar. */}
          <nav
            aria-label="On this page"
            className="mt-8 rounded-2xl border border-line bg-surface-1 p-4 lg:hidden"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">On this page</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-sm font-semibold text-brand-ink">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-10 flex flex-col gap-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-fg">
                  {section.title}
                </h2>
                <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-fg-2 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 border-t border-line pt-6 lg:hidden">
            <Link
              href={other.href}
              className="inline-flex items-center gap-2 text-sm font-bold text-fg-2 hover:text-fg"
            >
              <OtherIcon className="h-4 w-4" />
              Read the {other.label.toLowerCase()}
            </Link>
          </div>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}
