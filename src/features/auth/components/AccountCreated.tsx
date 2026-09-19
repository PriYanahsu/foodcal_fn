'use client';

import { useEffect } from 'react';
import { CheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { buttonClass, Spinner } from '@/components/ui/fc';

const REDIRECT_AFTER_MS = 2000;

interface AccountCreatedProps {
  email: string;
  onContinue: () => void;
}

export function AccountCreated({ email, onContinue }: AccountCreatedProps) {
  useEffect(() => {
    const timer = setTimeout(onContinue, REDIRECT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-brand/35 bg-brand/15">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-on-brand">
          <CheckIcon className="h-6 w-6" strokeWidth={2.5} />
        </span>
      </span>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-[30px] font-bold leading-tight tracking-[-0.02em] text-fg max-md:text-large-title">
          Account created
        </h2>
        <p className="text-base text-fg-2">Sign in to set up your plan.</p>
      </div>

      {email && (
        <div className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2 p-4 text-left">
          <EnvelopeIcon className="h-6 w-6 shrink-0 text-fg-2" />
          <div className="min-w-0">
            <p className="text-sm text-muted">Signed up as</p>
            <p className="truncate font-bold text-fg">{email}</p>
          </div>
        </div>
      )}

      <button type="button" onClick={onContinue} className={buttonClass('primary', 'lg', 'w-full')}>
        Sign in
      </button>
      <p role="status" className="flex items-center gap-2 text-sm text-muted">
        <Spinner className="h-4 w-4 text-brand" />
        Taking you to sign in…
      </p>
    </div>
  );
}
