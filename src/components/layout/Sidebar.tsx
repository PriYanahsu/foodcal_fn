'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HomeIcon,
    CameraIcon,
    ClockIcon,
    UserIcon,
    ArrowLeftStartOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline'; // Assumes heroicons is installed, if not we might need to install or use unicode/svgs

// Fallback SVGs if heroicons not available or to reduce deps
const Icons = {
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
    Scan: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>,
    History: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    Profile: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
    Logout: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>,
    Menu: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
    Close: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
}

const MENU_ITEMS = [
    { name: 'Dashboard', path: '/', icon: Icons.Home },
    { name: 'Scan Food', path: '/scan', icon: Icons.Scan },
    { name: 'Manual Entry', path: '/manualAddData', icon: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> },
    { name: 'History', path: '/history', icon: Icons.History },
    { name: 'Profile', path: '/profile', icon: Icons.Profile },
];

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            {/* Mobile Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[var(--card-bg)] rounded-lg text-white shadow-lg border border-[var(--card-border)]"
            >
                {isOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>

            {/* Mobile Sidebar & Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-40 w-64 bg-[var(--card-bg)] border-r border-[var(--card-border)] md:hidden"
                        >
                            <div className="flex flex-col h-full p-6">
                                <div className="mb-10 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"></div>
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                                        FoodCal
                                    </h1>
                                </div>

                                <nav className="flex-1 space-y-2">
                                    {MENU_ITEMS.map((item) => {
                                        const isActive = pathname === item.path;
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.path}
                                                href={item.path}
                                                onClick={() => setIsOpen(false)}
                                                className="relative block"
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="sidebar-active-mobile"
                                                        className="absolute inset-0 bg-[var(--primary)] rounded-xl shadow-[0_0_15px_#00ff8833]"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                    />
                                                )}
                                                <span className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                                    <Icon />
                                                    <span>{item.name}</span>
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="pt-6 border-t border-[var(--card-border)]">
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isLoggingOut ? (
                                            <svg className="animate-spin h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <Icons.Logout />
                                        )}
                                        <span>{isLoggingOut ? 'Logging Out...' : 'Log Out'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Static) */}
            <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-64 bg-[var(--card-bg)] border-r border-[var(--card-border)]">
                <div className="flex flex-col h-full p-6">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"></div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                            FoodCal
                        </h1>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {MENU_ITEMS.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className="relative block"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 bg-[var(--primary)] rounded-xl shadow-[0_0_15px_#00ff8833]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}
                                    <span className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                        <Icon />
                                        <span>{item.name}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-6 border-t border-[var(--card-border)]">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoggingOut ? (
                                <svg className="animate-spin h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <Icons.Logout />
                            )}
                            <span>{isLoggingOut ? 'Logging Out...' : 'Log Out'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
