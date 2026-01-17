import React from 'react';
import { Card } from '@/components/ui/Card';

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">History</h1>
      <Card className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)]">
        <p className="text-[var(--text-muted)]">History page content coming soon...</p>
      </Card>
    </div>
  );
}
