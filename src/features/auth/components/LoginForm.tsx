'use client';

import React, { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { useBackendStatus } from '@/features/backendStatus';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const { status, retry } = useBackendStatus();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // A previous wake-up gave up, so start a fresh one — the request below
    // queues behind it rather than failing on a server that is still booting.
    if (status === 'failed') retry();

    const result = await login({ email, password });
    if (result.success) {
      window.location.assign(ROUTES.HOME);
    }
  };

  const buttonLabel = isLoading
    ? status === 'waking'
      ? 'Starting server…'
      : 'Signing in…'
    : 'Sign In';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {validationError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{validationError}</p>
        </div>
      )}
      {isLoading && status === 'waking' && (
        <div className="p-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl">
          <p className="text-sm text-[var(--foreground)]">
            Waking the server — you&apos;ll be signed in as soon as it answers.
          </p>
        </div>
      )}

      <Input
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full h-14"
      >
        {buttonLabel}
      </Button>
    </form>
  );
};
