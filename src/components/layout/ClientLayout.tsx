'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { NotificationProvider } from '@/features/notifications/context/NotificationContext';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationToast } from '@/features/notifications/components/NotificationToast';
import { NotificationPrompt } from '@/features/notifications/components/NotificationPrompt';
import { StepTrackerProvider } from '@/features/activity/context/StepTrackerContext';
import { BRAND_ASSETS } from '@/lib/brand-config';
import { InstallAppPrompt } from './InstallAppPrompt';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Hide sidebar on login, signup, and landing page if applicable (though usually landing has its own layout)
    // Logic: Hide on /login, /signup
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <NotificationProvider>
            <StepTrackerProvider>
                <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
                    {!isAuthPage && <Sidebar />}

                    <main
                        className={`flex-1 transition-all duration-300 w-full relative ${!isAuthPage ? "pt-4" : ""} md:pt-0 ${!isAuthPage ? 'md:ml-64' : ''}`}
                    >
                        {/* Header area for notifications */}
                        {!isAuthPage && (
                            <>
                                <div className="absolute top-4 right-16 md:right-4 z-50 flex items-center gap-3">
                                    <NotificationBell />
                                    <NotificationToast />
                                </div>
                                <NotificationPrompt />
                            </>
                        )}

                        {/* Mobile Brand Header (Global) */}
                        {!isAuthPage && (
                            <div className="md:hidden absolute top-6 left-6 flex items-center gap-3 z-50">
                                <img src={BRAND_ASSETS.logo} alt="" className="w-8 h-8 rounded-lg object-contain" />
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                                    {BRAND_ASSETS.name}
                                </h1>
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </StepTrackerProvider>

            <InstallAppPrompt />
        </NotificationProvider >
    );
}
