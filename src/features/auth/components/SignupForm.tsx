'use client';

import React, { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

interface SignupFormProps {
  onSuccess: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { signup, isLoading, error } = useAuth();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic validation
    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    const defaultUsername = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const defaultName = email.split('@')[0];

    const result = await signup({
      name: defaultName,
      username: defaultUsername,
      email,
      gender: 'Other',
      password,
      confirmPassword: password,
    });

    if (result.success) {
      setSuccess(true);
      // Wait for 2 seconds then switch to login
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  if (success) {
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
        <h3 className="text-xl font-bold text-white mb-2">Account Created!</h3>
        <p className="text-[var(--text-muted)] mb-6">
          Your account has been successfully created.
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
      {validationError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{validationError}</p>
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
        placeholder="Create a password (min. 8 chars)"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full h-14 mt-2"
      >
        Create Account
      </Button>
    </form>
  );
};
