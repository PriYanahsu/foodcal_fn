'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/features/theme/context/ThemeContext';
import { isFeatureEnabled, type FeatureKey } from '@/config/features';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BRAND_ASSETS } from '@/lib/brand-config';

// Fallback SVGs if heroicons not available or to reduce deps
const Icons = {
  Home: () => (
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
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  ),
  Scan: () => (
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
        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
      />
    </svg>
  ),
  History: () => (
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
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  Profile: () => (
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
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  ),
  Logout: () => (
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
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
      />
    </svg>
  ),
  Menu: () => (
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
  ),
  Close: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  Bell: () => (
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  ),
  Settings: () => (
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
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.174.1.347.223.526.356.27.197.617.246.91.117l1.21-.537a1.125 1.125 0 0 1 1.45.54l1.298 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.45.541l-1.21-.536c-.294-.13-.64-.08-.912.118-.18.133-.352.256-.526.355-.332.183-.582.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a7.698 7.698 0 0 1-.526-.355c-.27-.199-.617-.247-.91-.118l-1.21.536a1.125 1.125 0 0 1-1.45-.54l-1.298-2.248a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.003-.827a1.125 1.125 0 0 1-.26-1.43l1.298-2.247a1.125 1.125 0 0 1 1.45-.541l1.21.537c.293.129.64.079.91-.117.18-.133.353-.257.527-.356.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  Chevron: ({ open }: { open: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
};

type MenuItem = {
  name: string;
  path: string;
  icon: () => ReactNode;
  feature?: FeatureKey;
};

type SettingsLink = {
  name: string;
  path: string;
  feature?: FeatureKey;
  danger?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { name: 'Nutrition', path: '/', icon: Icons.Home, feature: 'nutrition' },
  {
    name: 'Fitness',
    path: '/fitness',
    feature: 'fitness',
    icon: () => (
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
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
  },
  {
    name: 'Exercises',
    path: '/exercises',
    feature: 'exercises',
    icon: () => (
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
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
  },
  { name: 'Scan Food', path: '/scan', icon: Icons.Scan, feature: 'scan' },
  {
    name: 'Steps',
    path: '/steps',
    feature: 'steps',
    icon: () => (
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
          d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.5 1.89-4 4.5-4 2.1 0 3.3.7 4.5 2.5 1.2 1.8 1.5 2 2.5 2a3 3 0 0 1 2.5 1.5M14.5 18a4.5 4.5 0 0 1-5 0M12 21a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z"
        />
      </svg>
    ),
  },
  { name: 'History', path: '/history', icon: Icons.History, feature: 'history' },
  { name: 'Notifications', path: '/notifications', icon: Icons.Bell, feature: 'notifications' },
  { name: 'Profile', path: '/profile', icon: Icons.Profile, feature: 'profile' },
  { name: 'Demo', path: '/hero', icon: Icons.Logout },
];

const visibleMenuItems = () =>
  MENU_ITEMS.filter((item) => !item.feature || isFeatureEnabled(item.feature));


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SETTINGS_LINKS: SettingsLink[] = [
  { name: 'All settings', path: '/settings' },
  { name: 'Delete Account', path: '/settings?delete=1', danger: true },
];

function LogoutButton({
  isLoggingOut,
  onLogout,
}: {
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoggingOut ? (
        <svg
          className="animate-spin h-5 w-5 text-red-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <Icons.Logout />
      )}
      <span>{isLoggingOut ? 'Logging Out...' : 'Log Out'}</span>
    </button>
  );
}

function SidebarFooter({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isSettingsActive = pathname === '/settings' || pathname.startsWith('/settings/');

  const settingsLinks = SETTINGS_LINKS.filter(
    (item) => !item.feature || isFeatureEnabled(item.feature)
  );

  return (
    <div className="pt-4 border-t border-[var(--sidebar-border)] space-y-1">
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-colors text-[var(--sidebar-muted)] hover:text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-surface)]"
      >
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        )}
        <span className="flex-1 text-left">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>

      <button
        type="button"
        onClick={() => setSettingsOpen((v) => !v)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-colors ${
          isSettingsActive
            ? 'text-[var(--btn-primary)] bg-[var(--btn-primary)]/10'
            : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-surface)]'
        }`}
      >
        <Icons.Settings />
        <span className="flex-1 text-left">Settings</span>
        <Icons.Chevron open={settingsOpen} />
      </button>

      <AnimatePresence initial={false}>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-3 border-l border-[var(--sidebar-border)] space-y-0.5 py-1">
              {settingsLinks.map((item) => (
                <Link
                  key={item.path + item.name}
                  href={item.path}
                  onClick={onNavigate}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.danger
                      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                      : pathname === item.path
                        ? 'text-[var(--btn-primary)] bg-[var(--btn-primary)]/10'
                        : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-surface)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const menuItems = visibleMenuItems();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar & Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-[110] w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] md:hidden"
            >
              <div className="flex flex-col h-full min-h-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="mb-6 flex items-center gap-3 shrink-0">
                  <img
                    src={BRAND_ASSETS.logo}
                    alt={`${BRAND_ASSETS.name} Logo`}
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                  <h1 className="text-2xl font-bold text-[var(--primary)]">
                    FoodCal
                  </h1>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
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
                              className="absolute inset-0 bg-[var(--btn-primary)] rounded-xl shadow-[0_0_15px_#76b90033]"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                          )}
                          <span
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'text-black font-semibold' : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-fg)]'}`}
                          >
                            <Icon />
                            <span>{item.name}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </nav>

                  <SidebarFooter onNavigate={() => setIsOpen(false)} />
                </div>

                <div className="shrink-0 pt-3 mt-2 border-t border-[var(--sidebar-border)]">
                  <LogoutButton isLoggingOut={isLoggingOut} onLogout={handleLogout} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Static) */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]">
        <div className="flex flex-col h-full min-h-0 p-6">
          <div className="mb-10 flex items-center gap-3 shrink-0">
            <img
              src={BRAND_ASSETS.logo}
              alt={`${BRAND_ASSETS.name} Logo`}
              className="w-8 h-8 rounded-lg object-contain"
            />
            <h1 className="text-2xl font-bold text-[var(--primary)]">
              FoodCal
            </h1>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <nav className="space-y-2">
              {menuItems.map((item) => {
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
                        className="absolute inset-0 bg-[var(--btn-primary)] rounded-xl shadow-[0_0_15px_#76b90033]"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'text-black font-semibold' : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-fg)]'}`}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <SidebarFooter />
          </div>

          <div className="shrink-0 pt-3 mt-2 border-t border-[var(--sidebar-border)]">
            <LogoutButton isLoggingOut={isLoggingOut} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </>
  );
}
