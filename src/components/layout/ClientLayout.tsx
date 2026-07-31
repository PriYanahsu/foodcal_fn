'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { NotificationProvider } from '@/features/notifications/context/NotificationContext';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationToast } from '@/features/notifications/components/NotificationToast';
import { NotificationPrompt } from '@/features/notifications/components/NotificationPrompt';
import { StepTrackerProvider } from '@/features/activity/context/StepTrackerContext';
import { ThemeProvider } from '@/features/theme/context/ThemeContext';
import { BRAND_ASSETS } from '@/lib/brand-config';
import { isFeatureEnabled } from '@/config/features';
import { InstallAppPrompt } from './InstallAppPrompt';

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // Always open sections from the top — shared layout otherwise keeps scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {!isAuthPage && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}

      <main
        className={`flex-1 transition-all duration-300 w-full relative ${!isAuthPage ? 'md:ml-64' : ''}`}
      >
        {!isAuthPage && (
          <div className="md:hidden sticky top-0 z-[80] flex items-center justify-between px-4 py-2.5 bg-[var(--background)] border-0 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
              <img
                src={BRAND_ASSETS.logo}
                alt=""
                className="w-7 h-7 rounded-lg object-contain"
              />
              <h1 className="text-lg font-black text-[var(--primary)]">
                {BRAND_ASSETS.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <NotificationToast />
            </div>
          </div>
        )}

        {!isAuthPage && (
          <div className="hidden md:flex absolute top-4 right-4 z-[80] items-center gap-3">
            <NotificationBell />
            <NotificationToast />
          </div>
        )}

        {!isAuthPage && <NotificationPrompt />}

        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const shell = <AppShell>{children}</AppShell>;

  return (
    <ThemeProvider>
      <NotificationProvider>
        {isFeatureEnabled('steps') ? (
          <StepTrackerProvider>{shell}</StepTrackerProvider>
        ) : (
          shell
        )}

        <InstallAppPrompt />
      </NotificationProvider>
    </ThemeProvider>
  );
}
