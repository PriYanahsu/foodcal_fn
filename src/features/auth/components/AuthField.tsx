'use client';

import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useBackendStatus } from '@/features/backendStatus';

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string | null;
  /** Shown under the field when there is no error. */
  hint?: ReactNode;
}

export function AuthField({
  label,
  error,
  hint,
  type = 'text',
  id,
  ...inputProps
}: AuthFieldProps) {
  const generatedId = useId();
  // Prefer an id derived from the field name: only one auth form is on screen at a
  // time, and a name-based id can't differ between server and client render.
  const inputId = id ?? (inputProps.name ? `auth-${inputProps.name}` : generatedId);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const messageId = `${inputId}-message`;

  const stateClass = error
    ? 'border-danger ring-4 ring-danger/15 focus:border-danger'
    : 'border-line-strong focus:border-brand focus:ring-4 focus:ring-brand/15';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-fg-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={`h-[52px] w-full rounded-xl border bg-surface-2 px-4 text-base text-fg outline-none transition placeholder:text-muted ${
            isPassword ? 'pr-14' : ''
          } ${stateClass}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-fg-2 transition-colors hover:text-fg"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error ? (
        <p
          id={messageId}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-danger"
        >
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <div id={messageId}>{hint}</div>
      ) : null}
    </div>
  );
}

interface NoticeProps {
  tone: 'info' | 'danger' | 'warn';
  title: string;
  body?: string;
}

const NOTICE_TONES = {
  info: { box: 'border-info/35 bg-info/10', icon: 'text-info', Icon: InformationCircleIcon },
  danger: {
    box: 'border-danger/35 bg-danger/10',
    icon: 'text-danger',
    Icon: ExclamationTriangleIcon,
  },
  warn: { box: 'border-warn/35 bg-warn/10', icon: 'text-warn', Icon: ExclamationTriangleIcon },
};

export function Notice({ tone, title, body }: NoticeProps) {
  const { box, icon, Icon } = NOTICE_TONES[tone];

  return (
    <div
      role={tone === 'info' ? 'status' : 'alert'}
      className={`flex gap-3 rounded-2xl border p-4 ${box}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} />
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold leading-snug text-fg">{title}</p>
        {body && <p className="text-sm text-fg-2">{body}</p>}
      </div>
    </div>
  );
}

/**
 * Explains a cold backend where the user is looking. Hidden until the wake
 * has outlasted a warm server's reply, so a fast server never flashes it.
 */
export function ServerWakeNotice({ action }: { action: string }) {
  const { status, isWakingSlowly, isLocal } = useBackendStatus();

  if (isLocal || status === 'ready') return null;

  if (status === 'waking') {
    if (!isWakingSlowly) return null;
    return (
      <Notice
        tone="info"
        title={`Starting the server — about a minute. We’ll ${action} as soon as it answers.`}
        body="It sleeps when nobody’s using it. You can keep this screen open."
      />
    );
  }

  return (
    <Notice
      tone="warn"
      title="The server is taking longer than usual"
      body="Submit anyway and we’ll retry, or try again in a minute."
    />
  );
}

/** Password strength for the sign-up hint. Only length ≥ 8 is enforced. */
export function passwordStrength(password: string) {
  if (password.length < 8) return { score: 1, label: 'Too short', tone: 'danger' as const };
  let score = 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score], tone: score <= 2 ? ('warn' as const) : ('brand' as const) };
}
