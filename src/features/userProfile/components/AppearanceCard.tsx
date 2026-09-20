'use client';

import { ThemeSegmented } from '@/components/ui/ThemeSegmented';

export default function AppearanceCard() {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5">
      <div>
        <h2 className="text-lg font-bold text-fg">Appearance</h2>
        <p className="mt-0.5 text-subhead text-muted">Applies across FoodCal on this device.</p>
      </div>
      <ThemeSegmented />
    </section>
  );
}
