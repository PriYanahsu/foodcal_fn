'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { NotificationProvider } from '@/features/notifications/context/NotificationContext';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationToast } from '@/features/notifications/components/NotificationToast';
import { NotificationPrompt } from '@/features/notifications/components/NotificationPrompt';
import { StepTrackerProvider } from '@/features/activity/context/StepTrackerContext';
import { ThemeProvider } from '@/features/theme/context/ThemeContext';
import { isFeatureEnabled } from '@/config/features';
import { InstallAppPrompt } from './InstallAppPrompt';
import { WakeUpBanner } from '@/features/backendStatus';
import { PlanGateProvider, PlanRouteGuard, useOnboarding } from '@/features/onboarding';

/** Pages with their own public header/footer — no app sidebar, bell or push prompt. */
const PUBLIC_PAGES = ['/login', '/signup', '/privacy', '/terms'];
/** Signed-in, but full-screen and distraction-free: no nav, no permission prompts. */
const FOCUS_PAGES = ['/welcome'];
const hidesChrome = (pathname: string) =>
  PUBLIC_PAGES.includes(pathname) || FOCUS_PAGES.includes(pathname);

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthPage = hidesChrome(pathname);
  // Ask for notifications only once there's a plan to be reminded about.
  const { hasPlan } = useOnboarding();

  // Always open sections from the top — shared layout otherwise keeps scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  const shell = (
    // `min-h-dvh`, not `min-h-screen`: on a phone `100vh` is the tall viewport (URL bar
    // hidden) while the one-screen pages size themselves to `100dvh`. The difference is
    // exactly the URL bar, and it left every page scrollable by that much.
    <div className="flex min-h-dvh flex-col bg-canvas text-[var(--foreground)] md:flex-row">
      {!isAuthPage && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}

      <main
        className={`flex-1 transition-all duration-300 w-full relative ${
          // Phones: leave room for the bottom tab bar (68px + home-indicator inset).
          !isAuthPage ? 'md:ml-64 pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0' : ''
        }`}
      >
        {!isAuthPage && (
          <div className="sticky top-0 z-[80] flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur-xl md:hidden">
            <Link href="/" aria-label="FoodCal home">
              <Logo />
            </Link>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <NotificationToast />
            </div>
          </div>
        )}

        {/* The dashboard header has its own bell; other pages get the floating one. */}
        {!isAuthPage && (
          <div className="absolute right-4 top-4 z-[80] hidden items-center gap-3 md:flex">
            {pathname !== '/' && <NotificationBell />}
            <NotificationToast />
          </div>
        )}

        {!isAuthPage && hasPlan && <NotificationPrompt />}

        {children}
      </main>

      {!isAuthPage && <MobileTabBar onOpenMore={() => setIsSidebarOpen(true)} />}
    </div>
  );

  // Every signed-in app page (not login/legal, not the plan setup itself) is locked,
  // nav included, until the AI plan exists.
  return isAuthPage ? shell : <PlanRouteGuard>{shell}</PlanRouteGuard>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const shell = (
    <PlanGateProvider>
      <AppShell>{children}</AppShell>
    </PlanGateProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          {isFeatureEnabled('steps') ? <StepTrackerProvider>{shell}</StepTrackerProvider> : shell}

          <WakeUpBanner hasTabBar={!hidesChrome(pathname)} />
          {!FOCUS_PAGES.includes(pathname) && <InstallAppPrompt />}
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
