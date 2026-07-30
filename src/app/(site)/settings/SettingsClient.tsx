'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BellIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MoonIcon,
  ShieldCheckIcon,
  SunIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isFeatureEnabled } from '@/config/features';
import { useTheme } from '@/features/theme/context/ThemeContext';

type SettingLink = {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  show?: boolean;
};

export default function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('delete') === '1') {
      setShowDeleteConfirm(true);
    }
  }, [searchParams]);

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setConfirmText('');
    setError(null);
    if (searchParams.get('delete') === '1') {
      router.replace('/settings');
    }
  };

  const links: SettingLink[] = [
    {
      label: 'Edit Profile',
      description: 'Name, goals, body metrics, and photo',
      href: '/profile',
      icon: UserCircleIcon,
      show: isFeatureEnabled('profile'),
    },
    {
      label: 'Notifications',
      description: 'Reminders and push alerts',
      href: '/notifications',
      icon: BellIcon,
      show: isFeatureEnabled('notifications'),
    },
    {
      label: 'Privacy Policy',
      description: 'How we handle your data',
      href: '/privacy',
      icon: ShieldCheckIcon,
      show: true,
    },
    {
      label: 'Terms of Service',
      description: 'Rules for using FoodCal',
      href: '/terms',
      icon: DocumentTextIcon,
      show: true,
    },
  ];

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;

    try {
      setIsDeleting(true);
      setError(null);

      const res = await fetch('/api/delete-account', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      await logout();
      window.location.href = '/login';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Settings</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Manage your account and preferences
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 px-1">
          Appearance
        </h2>
        <Card className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center text-[var(--primary)] shrink-0">
                {theme === 'dark' ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)]">Theme</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Switch between dark and light mode
                </p>
              </div>
            </div>
            <div className="flex rounded-xl border border-[var(--card-border)] p-1 bg-[var(--surface)] shrink-0">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  theme === 'dark'
                    ? 'bg-[var(--btn-primary)] text-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  theme === 'light'
                    ? 'bg-[var(--btn-primary)] text-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-2 mb-10">
        {links
          .filter((item) => item.show !== false)
          .map(({ label, description, href, icon: Icon }) => (
            <Link key={href} href={href} className="block group">
              <Card className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)]/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--foreground)]">{label}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{description}</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-red-400/80 mb-3 px-1">
          Danger zone
        </h2>
        <Card className="p-4 bg-[var(--card-bg)] border border-red-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Delete account</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Permanently erase your profile, food logs, steps, weight history,
                  notifications, and photos. This cannot be undone.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setConfirmText('');
                  setError(null);
                }}
                className="!bg-red-500 !text-white !border-red-500 hover:!bg-red-600 hover:!border-red-600 !shadow-none hover:!shadow-none hover:!scale-[1.02]"
              >
                Delete account
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDeleteConfirm}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[var(--foreground)]">Delete your account?</h3>
            <p className="text-sm text-[var(--text-muted)]">
              All of your FoodCal data will be permanently removed. Type{' '}
              <span className="font-mono text-red-400">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              disabled={isDeleting}
              className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-400"
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
                onClick={closeDeleteConfirm}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 !bg-red-500 !text-white hover:!bg-red-600 !shadow-none"
                disabled={confirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                isLoading={isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? 'Deleting...' : 'Delete forever'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.back()}
        className="mt-10 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
