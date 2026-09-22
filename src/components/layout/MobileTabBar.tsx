'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';
import {
  ArrowTrendingUpIcon,
  Bars3Icon,
  CameraIcon,
  ClockIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowTrendingUpIcon as ArrowTrendingUpSolid,
  ClockIcon as ClockSolid,
  HomeIcon as HomeSolid,
} from '@heroicons/react/24/solid';
import { isFeatureEnabled, type FeatureKey } from '@/config/features';
import { useNotifications } from '@/features/notifications/context/NotificationContext';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

type Tab = { name: string; path: string; icon: Icon; activeIcon: Icon; feature: FeatureKey };

const LEFT_TABS: Tab[] = [
  { name: 'Nutrition', path: '/', icon: HomeIcon, activeIcon: HomeSolid, feature: 'nutrition' },
  {
    name: 'History',
    path: '/history',
    icon: ClockIcon,
    activeIcon: ClockSolid,
    feature: 'history',
  },
];

const RIGHT_TABS: Tab[] = [
  {
    name: 'My plan',
    path: '/fitness',
    icon: ArrowTrendingUpIcon,
    activeIcon: ArrowTrendingUpSolid,
    feature: 'fitness',
  },
];

const isActive = (pathname: string, path: string) =>
  path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);

function TabLink({ tab, pathname }: { tab: Tab; pathname: string }) {
  const active = isActive(pathname, tab.path);
  const Icon = active ? tab.activeIcon : tab.icon;
  return (
    <Link
      href={tab.path}
      aria-current={active ? 'page' : undefined}
      className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
        active ? 'text-brand-ink' : 'text-muted hover:text-fg'
      }`}
    >
      <Icon className="h-6 w-6" />
      {tab.name}
    </Link>
  );
}

/**
 * Phone navigation: Nutrition · History · [Log a meal] · My plan · More.
 * "More" opens the full menu (notifications, settings, theme, profile, log out).
 */
export function MobileTabBar({ onOpenMore }: { onOpenMore: () => void }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const scanActive = isActive(pathname, '/scan');
  const visible = (tabs: Tab[]) => tabs.filter((tab) => isFeatureEnabled(tab.feature));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-line bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-[68px] max-w-lg grid-cols-5 items-center px-2">
        {visible(LEFT_TABS).map((tab) => (
          <TabLink key={tab.path} tab={tab} pathname={pathname} />
        ))}

        {isFeatureEnabled('scan') && (
          <div className="flex justify-center">
            <Link
              href="/scan"
              aria-label="Log a meal"
              aria-current={scanActive ? 'page' : undefined}
              className={`-mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-on-brand shadow-[0_12px_28px_-8px_rgb(var(--fc-brand-rgb)/0.75)] ring-[6px] ring-canvas transition-transform active:scale-95 ${
                scanActive ? 'scale-105' : ''
              }`}
            >
              <CameraIcon className="h-7 w-7" strokeWidth={2} />
            </Link>
          </div>
        )}

        {visible(RIGHT_TABS).map((tab) => (
          <TabLink key={tab.path} tab={tab} pathname={pathname} />
        ))}

        <button
          type="button"
          onClick={onOpenMore}
          aria-label={unreadCount ? `More, ${unreadCount} unread notifications` : 'More'}
          className="relative flex h-full flex-col items-center justify-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-fg"
        >
          <span className="relative">
            <Bars3Icon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-canvas" />
            )}
          </span>
          More
        </button>
      </div>
    </nav>
  );
}
