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
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male'); // Default
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { signup, isLoading, error } = useAuth();
  // const router = useRouter(); // Not needed for signup flow update

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic validation
    if (!name || !username || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const result = await signup({
      name,
      username,
      email,
      gender,
      password,
      confirmPassword
    });

    if (result.success) {
      onSuccess();
    }
  };

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

      <Input
        type="text"
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your full name"
        required
      />

      <Input
        type="text"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Choose a username"
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <Input
        type="email"
        label="Email"
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
        placeholder="Create a password (min. 6 characters)"
        required
      />

      <Input
        type="password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm your password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Sign Up
      </Button>
    </form>
  );
};
