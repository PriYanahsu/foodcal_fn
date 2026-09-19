'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Logo } from '@/components/brand/Logo';
import { buttonClass } from '@/components/ui/fc';

interface LandingNavProps {
  /**
   * On the landing page, sign in / sign up open in place via these handlers.
   * Other public pages (privacy, terms) omit them and link to /login instead.
   */
  onSignIn?: () => void;
  onGetStarted?: () => void;
  /** Marks the matching nav link as the current page. */
  current?: 'privacy';
}

/** Where section links and CTAs point when we're not on the landing page itself. */
const LANDING_PATH = '/login';

/** A button when there's a handler, otherwise a link to the landing page with the form open. */
function Cta({
  onClick,
  view,
  className,
  children,
}: {
  onClick?: () => void;
  view: 'login' | 'signup';
  className: string;
  children: ReactNode;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link href={`${LANDING_PATH}?view=${view}`} className={className}>
      {children}
    </Link>
  );
}

export function LandingNav({ onSignIn, onGetStarted, current }: LandingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const onLanding = Boolean(onSignIn);
  const sectionBase = onLanding ? '' : LANDING_PATH;

  const navLinks = [
    { label: 'How it works', href: `${sectionBase}#how-it-works`, current: false },
    { label: 'Features', href: `${sectionBase}#features`, current: false },
    { label: 'Privacy', href: '/privacy', current: current === 'privacy' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-8">
        <Link href={onLanding ? '#top' : LANDING_PATH} aria-label="FoodCal home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.current ? 'page' : undefined}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-surface-2 hover:text-fg ${
                link.current ? 'bg-surface-2 text-fg' : 'text-fg-2'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Cta onClick={onSignIn} view="login" className={buttonClass('ghost', 'sm')}>
            Sign in
          </Cta>
          {/* Wrapper carries the breakpoint: the button's own inline-flex would override `hidden`. */}
          <span className="hidden md:block">
            <Cta onClick={onGetStarted} view="signup" className={buttonClass('primary', 'sm')}>
              Get started
            </Cta>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-2 md:hidden"
          >
            {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="landing-menu"
          aria-label="Main"
          className="border-t border-line px-4 pb-4 pt-2 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={link.current ? 'page' : undefined}
              className="flex h-12 items-center rounded-xl px-3 text-base font-semibold text-fg-2 hover:bg-surface-2 hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
          <Cta
            onClick={
              onGetStarted &&
              (() => {
                setMenuOpen(false);
                onGetStarted();
              })
            }
            view="signup"
            className={buttonClass('primary', 'md', 'mt-2 w-full')}
          >
            Get started — it’s free
          </Cta>
        </nav>
      )}
    </header>
  );
}
