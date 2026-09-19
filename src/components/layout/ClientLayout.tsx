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

/** Pages with their own public header/footer — no app sidebar, bell or push prompt. */
const PUBLIC_PAGES = ['/login', '/signup', '/privacy', '/terms'];

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthPage = PUBLIC_PAGES.includes(pathname);

  // Always open sections from the top — shared layout otherwise keeps scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-canvas text-[var(--foreground)]">
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

        {!isAuthPage && <NotificationPrompt />}

        {children}
      </main>

      {!isAuthPage && <MobileTabBar onOpenMore={() => setIsSidebarOpen(true)} />}
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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

  const shell = <AppShell>{children}</AppShell>;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          {isFeatureEnabled('steps') ? <StepTrackerProvider>{shell}</StepTrackerProvider> : shell}

          <WakeUpBanner />
          <InstallAppPrompt />
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
