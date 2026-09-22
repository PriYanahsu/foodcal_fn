'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/fc';

interface DeleteAccountDialogProps {
  open: boolean;
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  isDeleting: boolean;
  canConfirm: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** Typed confirmation before the account and everything in it is removed. */
export default function DeleteAccountDialog({
  open,
  confirmText,
  onConfirmTextChange,
  isDeleting,
  canConfirm,
  error,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[var(--fc-scrim)] p-4 backdrop-blur-sm sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <section className="relative flex w-full max-w-md flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-6 font-ui text-fg shadow-[var(--fc-shadow-pop)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-danger/15 text-danger">
            <TrashIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight text-fg">Delete your account?</h2>
            <p className="text-caption text-muted">This cannot be undone.</p>
          </div>
        </div>

        <p className="text-footnote leading-relaxed text-fg-2">
          Every meal, plan, weigh-in and photo is removed for good. Type{' '}
          <span className="font-mono font-bold text-danger">DELETE</span> to confirm.
        </p>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          placeholder="Type DELETE"
          disabled={isDeleting}
          autoFocus
          className="h-12 w-full rounded-2xl border-2 border-line-strong bg-surface-2 px-4 text-base text-fg outline-none transition-colors placeholder:text-muted focus:border-danger"
        />

        {error && <p className="text-footnote font-semibold text-danger">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-12 flex-1 rounded-2xl border border-line-strong bg-surface-2 text-base font-bold text-fg transition-colors hover:bg-surface-3 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || isDeleting}
            className="inline-flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-danger text-base font-bold text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting && <Spinner className="h-4 w-4" />}
            {isDeleting ? 'Deleting…' : 'Delete forever'}
          </button>
        </div>
      </section>
    </div>
  );
}
