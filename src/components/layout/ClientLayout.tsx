'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Hide sidebar on login, signup, and landing page if applicable (though usually landing has its own layout)
    // Logic: Hide on /login, /signup
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {!isAuthPage && <Sidebar />}

            <main
                className={`flex-1 transition-all duration-300 w-full ${!isAuthPage ? 'md:ml-64' : ''}`}
            >
                {children}
            </main>
        </div>
    );
}
