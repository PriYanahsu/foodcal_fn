'use client';

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { useBackendStatus } from '@/features/backendStatus';
import { buttonClass, Spinner } from '@/components/ui/fc';
import { AuthField, Notice, ServerWakeNotice } from './AuthField';

interface LoginFormProps {
  /** Pre-fills the email, e.g. right after sign-up. */
  initialEmail?: string;
  /** Shows a "session expired" notice after the API signed the user out. */
  sessionExpired?: boolean;
  onCreateAccount: () => void;
}

type FieldErrors = { email?: string; password?: string };

export const LoginForm: React.FC<LoginFormProps> = ({
  initialEmail = '',
  sessionExpired = false,
  onCreateAccount,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { login, isLoading, error } = useAuth();
  const { status, isWakingSlowly, retry } = useBackendStatus();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: FieldErrors = {};
    if (!email) errors.email = 'Enter your email address';
    else if (!email.includes('@')) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Enter your password';
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    // A previous wake-up gave up, so start a fresh one — the request below
    // queues behind it rather than failing on a server that is still booting.
    if (status === 'failed') retry();

    const result = await login({ email, password });
    if (result.success) {
      window.location.assign(ROUTES.HOME);
    }
  };

  const buttonLabel = isLoading ? (isWakingSlowly ? 'Starting server…' : 'Signing in…') : 'Sign in';

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {error ? (
          <Notice tone="danger" title={error} />
        ) : (
          sessionExpired && (
            <Notice
              tone="warn"
              title="Your session has expired"
              body="Please sign in again to load your latest data."
            />
          )
        )}

        <AuthField
          type="email"
          label="Email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <AuthField
          type="password"
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Your password"
          error={fieldErrors.password}
        />

        <ServerWakeNotice action="sign you in" />

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className={buttonClass('primary', 'lg', 'w-full')}
        >
          {isLoading && <Spinner />}
          {buttonLabel}
        </button>
      </form>

      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        New to FoodCal?
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={onCreateAccount}
        className={buttonClass('secondary', 'lg', 'w-full')}
      >
        Create an account
      </button>
    </div>
  );
};
