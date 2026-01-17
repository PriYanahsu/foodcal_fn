'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Check if user already has an ID (is logged in)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card className="p-8 bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-[var(--text-muted)]">
              {isLogin
                ? 'Sign in to continue to FoodCal'
                : 'Sign up to start tracking your nutrition'}
            </p>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="flex mb-8 bg-[var(--background)] rounded-xl p-1 border border-[var(--card-border)]">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${isLogin
                ? 'bg-[var(--card-bg)] text-white shadow-lg border border-[var(--card-border)]'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${!isLogin
                ? 'bg-[var(--card-bg)] text-white shadow-lg border border-[var(--card-border)]'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {isLogin ? <LoginForm /> : <SignupForm />}
        </Card>
      </div>
    </div>
  );
};
