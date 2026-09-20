'use client';

// TEMPORARY harness — deleted once the toast is checked at each size.
import React from 'react';
import { SuccessToast } from '@/components/ui/SuccessToast';

export default function UiPreview() {
  return (
    <div className="px-4 py-6 font-ui text-fg">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Toast preview</h1>
      <p className="mt-2 text-sm text-muted">The toast renders below, portalled to the body.</p>
      <SuccessToast
        message="Logged to Dinner"
        detail="Chicken biryani with raita · 620 kcal"
        actionLabel="View in History"
        actionHref="/history"
        durationMs={600000}
        onClose={() => {}}
      />
    </div>
  );
}
