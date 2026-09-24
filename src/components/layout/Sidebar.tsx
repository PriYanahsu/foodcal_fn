'use client';

import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import { usePlanGate } from '@/features/onboarding';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightOnRectangleIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  BoltIcon,
  CameraIcon,
  ClockIcon,
  Cog6ToothIcon,
  HomeIcon,
  LockClosedIcon,
  MapIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { isFeatureEnabled, type FeatureKey } from '@/config/features';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/features/theme/context/ThemeContext';
import { useNotifications } from '@/features/notifications/context/NotificationContext';
import { useFitnessProfile, useUserProfile } from '@/features/userProfile';
import { useDailyStats } from '@/features/Nutrition/hooks/useDailyStats';
import { toLocalDate, toStatsDate } from '@/features/Nutrition/utils/toLocalDate';
import { Logo } from '@/components/brand/Logo';
import { Spinner } from '@/components/ui/fc';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  name: string;
  path: string;
  icon: Icon;
  feature?: FeatureKey;
};

const TRACK_ITEMS: NavItem[] = [
  { name: 'Nutrition', path: '/', icon: HomeIcon, feature: 'nutrition' },
  { name: 'Scan a meal', path: '/scan', icon: CameraIcon, feature: 'scan' },
  { name: 'History', path: '/history', icon: ClockIcon, feature: 'history' },
  { name: 'My plan', path: '/fitness', icon: ArrowTrendingUpIcon, feature: 'fitness' },
  { name: 'Exercises', path: '/exercises', icon: BoltIcon, feature: 'exercises' },
  { name: 'Steps', path: '/steps', icon: MapIcon, feature: 'steps' },
];

/** Already in the phone's bottom tab bar, so the "More" sheet leaves them out. */
const TAB_BAR_PATHS = new Set(['/', '/scan', '/history', '/fitness']);

const visible = (items: NavItem[]) =>
  items.filter((item) => !item.feature || isFeatureEnabled(item.feature));

const isActive = (pathname: string, path: string) =>
  path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);

const ITEM_BASE =
  'flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors';
const ITEM_IDLE = 'text-fg-2 hover:bg-surface-2 hover:text-fg';
const ITEM_ACTIVE = 'bg-brand font-semibold text-on-brand';

function NavLink({
  item,
  pathname,
  badge,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  badge?: number;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item.path);
  const Icon = item.icon;
  const { canLog, showPlanWarning } = usePlanGate();
  // Scanning needs a plan: explain instead of opening the scanner.
  const locked = item.path === '/scan' && !canLog;

  return (
    <Link
      href={item.path}
      onClick={(e) => {
        if (locked) {
          e.preventDefault();
          showPlanWarning();
        }
        onNavigate?.();
      }}
      aria-current={active ? 'page' : undefined}
      className={`${ITEM_BASE} ${active ? ITEM_ACTIVE : ITEM_IDLE}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 truncate">{item.name}</span>
      {locked && (
        <LockClosedIcon aria-label="Needs a plan" className="h-4 w-4 shrink-0 text-muted" />
      )}
      {!!badge && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
            active ? 'bg-on-brand text-brand' : 'bg-brand text-on-brand'
          }`}
          aria-label={`${badge} unread`}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 pt-5 text-xs font-bold uppercase tracking-[0.08em] text-muted first:pt-0">
      {children}
    </p>
  );
}

/** Today's calories against the plan's goal — a glanceable summary on every page. */
function TodaySummary({ onNavigate }: { onNavigate?: () => void }) {
  const { stats } = useDailyStats(toStatsDate(toLocalDate()));
  const { fitness } = useFitnessProfile();
  const goal = fitness.dailyCalorieTarget;
  const eaten = Math.round(stats.calories);
  const pct = goal ? Math.min((eaten / goal) * 100, 100) : 0;

  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface-1 p-3.5 transition-colors hover:border-line-strong"
    >
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted">Today</span>
        <span className="tabular-nums text-fg">
          <span className="font-bold">{eaten.toLocaleString('en-US')}</span>
          {goal ? ` / ${goal.toLocaleString('en-US')} kcal` : ' kcal'}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className={`h-full rounded-full ${goal && eaten > goal ? 'bg-warn' : 'bg-brand'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="truncate text-xs text-muted">
        {fitness.objective ? `Plan: ${fitness.objective.toLowerCase()}` : 'No plan yet'}
      </p>
    </Link>
  );
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

function SidebarContent({
  onNavigate,
  inSheet = false,
}: {
  onNavigate?: () => void;
  /** Rendered in the phone "More" sheet: skip items the tab bar already has. */
  inSheet?: boolean;
}) {
  const pathname = usePathname();
  const trackItems = visible(TRACK_ITEMS).filter(
    (item) => !inSheet || !TAB_BAR_PATHS.has(item.path)
  );
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const name = profile.fullName || user?.name || 'Your profile';
  const profileActive = isActive(pathname, '/profile');

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
    <div className="flex h-full min-h-0 flex-col gap-6 p-4 font-ui">
      <Link href="/" onClick={onNavigate} aria-label="FoodCal home" className="px-2 pt-2">
        <Logo />
      </Link>

      <nav
        aria-label="Main"
        className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1"
      >
        {trackItems.length > 0 && <SectionLabel>Track</SectionLabel>}
        {trackItems.map((item) => (
          <NavLink key={item.path} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        <SectionLabel>Account</SectionLabel>
        {isFeatureEnabled('notifications') && (
          <NavLink
            item={{ name: 'Notifications', path: '/notifications', icon: BellIcon }}
            pathname={pathname}
            badge={unreadCount}
            onNavigate={onNavigate}
          />
        )}
        <NavLink
          item={{ name: 'Settings', path: '/settings', icon: Cog6ToothIcon }}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <button type="button" onClick={toggleTheme} className={`${ITEM_BASE} ${ITEM_IDLE}`}>
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          <span className="flex-1 text-left">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </nav>

      <div className="flex flex-col gap-3">
        {isFeatureEnabled('nutrition') && <TodaySummary onNavigate={onNavigate} />}

        <div className="flex items-center gap-1">
          <Link
            href="/profile"
            onClick={onNavigate}
            aria-current={profileActive ? 'page' : undefined}
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2 ${
              profileActive ? 'bg-surface-2' : ''
            }`}
          >
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element -- avatar URLs come from storage */
              <img
                src={profile.avatar_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-3 text-sm font-bold text-fg">
                {initials(name)}
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold text-fg">{name}</span>
              <span className="text-xs text-muted">View profile</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
            title="Log out"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-60"
          >
            {isLoggingOut ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  // The page behind the "More" sheet shouldn't scroll while it's open.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <>
      {/* Phones: the "More" tab opens the full menu as a bottom sheet. */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[var(--fc-scrim)] backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) setIsOpen(false);
              }}
              aria-label="Menu"
              aria-modal="true"
              role="dialog"
              className="fixed inset-x-0 bottom-0 z-[110] flex max-h-[88dvh] flex-col rounded-t-[28px] border-t border-line-strong bg-canvas-2 pb-[env(safe-area-inset-bottom)] shadow-[var(--fc-shadow-sheet)] md:hidden"
            >
              {/* Drag handle: swipe down to close. */}
              <div className="flex shrink-0 justify-center pb-1 pt-3" aria-hidden="true">
                <span className="h-1.5 w-10 rounded-full bg-line-strong" />
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <SidebarContent inSheet onNavigate={() => setIsOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop */}
      <aside
        aria-label="Sidebar"
        className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-canvas-2 md:block"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
