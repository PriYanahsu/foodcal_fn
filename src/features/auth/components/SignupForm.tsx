'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { SignupCredentials } from '../types';
import { useBackendStatus } from '@/features/backendStatus';
import { buttonClass, Spinner } from '@/components/ui/fc';
import { AuthField, Notice, ServerWakeNotice, passwordStrength } from './AuthField';

interface SignupFormProps {
  /** Called when the account exists but the user still has to sign in. */
  onCreated: (email: string) => void;
  onSignIn: () => void;
}

type FieldName = 'fullName' | 'email' | 'password';
type FieldErrors = Partial<Record<FieldName, string>>;

const INITIAL_FORM: SignupCredentials = {
  fullName: '',
  email: '',
  password: '',
  // Gender is asked in the plan wizard; the signup API still expects a value.
  gender: 'Other',
};

const STRENGTH_COLOURS = { danger: 'bg-danger', warn: 'bg-warn', brand: 'bg-brand' };
const STRENGTH_TEXT = { danger: 'text-danger', warn: 'text-warn', brand: 'text-brand-ink' };

function PasswordHint({ password }: { password: string }) {
  if (!password) return <p className="text-[13px] text-muted">At least 8 characters</p>;

  const { score, label, tone } = passwordStrength(password);
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full ${segment <= score ? STRENGTH_COLOURS[tone] : 'bg-surface-3'}`}
          />
        ))}
      </div>
      <p className="shrink-0 text-[13px] text-muted">
        <span className={`font-bold ${STRENGTH_TEXT[tone]}`}>{label}</span> · At least 8 characters
      </p>
    </div>
  );
}

export const SignupForm: React.FC<SignupFormProps> = ({ onCreated, onSignIn }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { signup, isLoading, error } = useAuth();
  const { status, isWakingSlowly, retry } = useBackendStatus();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { fullName, email, password } = form;
    const errors: FieldErrors = {};
    if (!fullName.trim()) errors.fullName = 'Enter your full name';
    if (!email) errors.email = 'Enter your email address';
    else if (!email.includes('@')) errors.email = 'Enter a valid email address';
    if (password.length < 8) errors.password = 'Use at least 8 characters';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // A previous wake-up gave up, so start a fresh one — the request below
    // queues behind it rather than failing on a server that is still booting.
    if (status === 'failed') retry();

    const result = await signup(form);
    if (!result.success) return;

    if (result.authenticated) {
      window.location.assign(ROUTES.HOME);
      return;
    }
    onCreated(email);
  };

  const buttonLabel = isLoading
    ? isWakingSlowly
      ? 'Starting server…'
      : 'Creating account…'
    : 'Create account';

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {error && <Notice tone="danger" title={error} />}

        <AuthField
          type="text"
          name="fullName"
          label="Full name"
          autoComplete="name"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Your name"
          error={fieldErrors.fullName}
        />

        <AuthField
          type="email"
          name="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <AuthField
          type="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          error={fieldErrors.password}
          hint={<PasswordHint password={form.password} />}
        />

        <ServerWakeNotice action="create your account" />

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className={buttonClass('primary', 'lg', 'w-full')}
        >
          {isLoading && <Spinner />}
          {buttonLabel}
        </button>

        <p className="text-center text-[13px] leading-relaxed text-muted">
          By continuing you agree to the{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-fg">
            Terms of service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
            Privacy policy
          </Link>
          .
        </p>
      </form>

      <div className="border-t border-line pt-5 text-center text-[15px] text-muted">
        Already have an account?{' '}
        <button type="button" onClick={onSignIn} className="font-bold text-fg-2 hover:text-fg">
          Sign in
        </button>
      </div>
    </div>
  );
};
