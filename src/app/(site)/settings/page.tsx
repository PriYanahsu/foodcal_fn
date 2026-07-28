import { Suspense } from 'react';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 pb-16 px-4 md:px-6 max-w-2xl mx-auto">
          <p className="text-[var(--text-muted)]">Loading settings...</p>
        </div>
      }
    >
      <SettingsClient />
    </Suspense>
  );
}
