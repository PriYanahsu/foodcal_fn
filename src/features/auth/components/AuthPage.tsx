'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Card } from '@/components/ui/Card';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Check if user already has an ID (is logged in)
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.id) {
          // User is already logged in, could redirect to home
          // For now, we'll just show the form
        }
      } catch (e) {
        // Invalid user data, continue with auth
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to continue to FoodCal'
                : 'Sign up to start tracking your nutrition'}
            </p>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
