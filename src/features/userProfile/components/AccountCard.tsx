'use client';

import { AccountCardProps } from '../type';

export default function AccountCard({ onLogout, onDelete }: AccountCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-fg">Account</h2>
        <p className="mt-0.5 text-subhead text-muted">
          Deleting your account removes all meals, plans and photos. This can&apos;t be undone.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onLogout}
          className="h-11 flex-1 rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg transition-colors hover:bg-surface-3 md:flex-none"
        >
          Log out
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="h-11 flex-1 rounded-xl border border-danger/40 px-4 text-sm font-bold text-danger transition-colors hover:bg-danger/10 md:flex-none"
        >
          Delete account
        </button>
      </div>
    </section>
  );
}
