'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { SignupCredentials } from '../types';
import { useBackendStatus } from '@/features/backendStatus';

interface SignupFormProps {
  onSuccess: () => void;
}

const INITIAL_FORM: SignupCredentials & {
  validationError: string | null;
  success: boolean;
  successMessage: string | null;
} = {
  fullName: '',
  email: '',
  password: '',
  gender: 'Other',
  validationError: null,
  success: false,
  successMessage: null,
};

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const { signup, isLoading, error } = useAuth();
  const { status, retry } = useBackendStatus();

  const submitSignup = async () => {
    const { fullName, email, password, gender } = form;
    const result = await signup({ fullName, email, password, gender });

    if (result.success) {
      if (result.authenticated) {
        window.location.assign(ROUTES.HOME);
        return;
      }
      setForm((prev) => ({
        ...prev,
        success: true,
        successMessage: result.message || 'Your account has been successfully created.',
      }));
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, validationError: null }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { fullName, email, password } = form;

    if (!fullName || !email || !password) {
      setForm((prev) => ({ ...prev, validationError: 'Please fill in all fields' }));
      return;
    }

    if (!email.includes('@')) {
      setForm((prev) => ({ ...prev, validationError: 'Please enter a valid email address' }));
      return;
    }

    if (password.length < 8) {
      setForm((prev) => ({
        ...prev,
        validationError: 'Password must be at least 8 characters long',
      }));
      return;
    }

    // A previous wake-up gave up, so start a fresh one — the request below
    // queues behind it rather than failing on a server that is still booting.
    if (status === 'failed') retry();

    await submitSignup();
  };

  const buttonLabel = isLoading
    ? status === 'waking'
      ? 'Starting server…'
      : 'Creating account…'
    : 'Create Account';

  if (form.success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Account Created!</h3>
        <p className="text-[var(--text-muted)] mb-6">
          {form.successMessage || 'Your account has been successfully created.'}
          <br />
          Redirecting to login...
        </p>
        <Button onClick={onSuccess} variant="primary" className="w-full">
          Sign In Now
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {form.validationError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{form.validationError}</p>
        </div>
      )}
      {isLoading && status === 'waking' && (
        <div className="p-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl">
          <p className="text-sm text-[var(--foreground)]">
            Waking the server — your account is created as soon as it answers.
          </p>
        </div>
      )}

      <Input
        type="text"
        name="fullName"
        label="Full Name"
        value={form.fullName}
        onChange={handleChange}
        placeholder="Enter your full name"
        required
      />

      <Input
        type="email"
        name="email"
        label="Email Address"
        value={form.email}
        onChange={handleChange}
        placeholder="Enter your email"
        required
      />

      <Input
        type="password"
        name="password"
        label="Password"
        value={form.password}
        onChange={handleChange}
        placeholder="Create a password (min. 8 chars)"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full h-14 mt-2"
      >
        {buttonLabel}
      </Button>
    </form>
  );
};
