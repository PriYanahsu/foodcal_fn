'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { AUTH_PANEL_ID, LandingPage } from '@/features/landing/components/LandingPage';
import { useAuth } from '../hooks/useAuth';
import { AUTH_VIEW_PARAM, parseAuthView, type AuthView, type LinkableAuthView } from '../authView';
import { AuthPanel } from './AuthPanel';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { AccountCreated } from './AccountCreated';

/** Height of the landing page's sticky nav on phones. */
const NAV_HEIGHT = 64;

interface AuthPageProps {
  initialView?: LinkableAuthView;
}

/**
 * The landing page. Sign in / sign up open as a card in the hero, in place of
 * the product visual — no separate screen. Each view still gets its own URL
 * (`?view=signup`) so it can be linked to and Back closes it.
 */
export const AuthPage: React.FC<AuthPageProps> = ({ initialView = 'landing' }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [createdEmail, setCreatedEmail] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const onPopState = () =>
      setView(parseAuthView(new URLSearchParams(window.location.search).get(AUTH_VIEW_PARAM)));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: LinkableAuthView, { replace = false } = {}) => {
    const url = new URL(window.location.href);
    if (next === 'landing') url.searchParams.delete(AUTH_VIEW_PARAM);
    else url.searchParams.set(AUTH_VIEW_PARAM, next);
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
    setView(next);

    if (next === 'landing') return;

    // Bring the card into view when it was opened from further down the page.
    // Desktop: the card sits in the first screen, so go to the top.
    if (window.matchMedia('(min-width: 1024px)').matches) {
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Phones/tablets: the card sits below the hero text. Wait for it to replace the
    // visual (exit 150ms) so we measure the card, not the shorter visual.
    window.setTimeout(() => {
      const panel = document.getElementById(AUTH_PANEL_ID);
      if (!panel) return;
      const { top, bottom } = panel.getBoundingClientRect();
      if (top < NAV_HEIGHT || bottom > window.innerHeight) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }, []);

  const goToLogin = useCallback(() => navigate('login'), [navigate]);
  const goToSignup = useCallback(() => navigate('signup'), [navigate]);
  const close = useCallback(() => navigate('landing'), [navigate]);
  // The "created" card stands in for sign-up, so replace that history entry.
  const continueToLogin = useCallback(() => navigate('login', { replace: true }), [navigate]);

  const authPanel =
    view === 'landing' ? null : (
      <AuthPanel view={view} onClose={close}>
        {view === 'login' && <LoginForm initialEmail={createdEmail} onCreateAccount={goToSignup} />}
        {view === 'signup' && (
          <SignupForm
            onSignIn={goToLogin}
            onCreated={(email) => {
              setCreatedEmail(email);
              setView('created');
            }}
          />
        )}
        {view === 'created' && <AccountCreated email={createdEmail} onContinue={continueToLogin} />}
      </AuthPanel>
    );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-canvas font-ui text-fg antialiased selection:bg-brand selection:text-on-brand">
        <LandingPage onSignIn={goToLogin} onGetStarted={goToSignup} authPanel={authPanel} />
      </div>
    </MotionConfig>
  );
};
