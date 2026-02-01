'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_ASSETS } from '@/lib/brand-config';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
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

  // Back button component
  const BackButton = () => (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: 0.2 }}
      onClick={() => setView('landing')}
      className="absolute top-4 left-4 sm:top-6 sm:left-6 text-[var(--text-muted)] hover:text-white flex items-center gap-1.5 transition-colors z-20 group text-sm sm:text-base font-medium py-2 px-3 rounded-lg hover:bg-white/5"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Back
    </motion.button>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center bg-[var(--background)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden overflow-y-auto custom-scrollbar">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[var(--primary)]/15 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[var(--secondary)]/15 rounded-full blur-[80px] sm:blur-[100px] animate-pulse delay-1000" />

        {/* Rotating Rings - Hide on very small screens to save performance/visual clutter */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] rounded-full border border-white/5 opacity-20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] lg:w-[600px] h-[450px] lg:h-[600px] rounded-full border border-white/5 opacity-20"
        />
      </div>

      <div className="w-full max-w-[440px] relative z-10 perspective-1000 my-auto">
        <Card className="h-fit flex flex-col justify-center p-4 sm:p-10 bg-[var(--card-bg)]/85 backdrop-blur-xl border border-[var(--card-border)] shadow-2xl rounded-2xl sm:rounded-3xl relative overflow-hidden transition-all duration-300">

          <AnimatePresence mode="wait" initial={false}>
            {/* Landing View */}
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-center space-y-6 sm:space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center shadow-lg transform rotate-3 overflow-hidden border border-white/10"
                  >
                    <img src={BRAND_ASSETS.logo} alt={BRAND_ASSETS.name} className="w-full h-full object-contain" />
                  </motion.div>

                  <div className="space-y-2">
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] tracking-tight"
                    >
                      {BRAND_ASSETS.name}
                    </motion.h1>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-[var(--text-muted)] text-base sm:text-lg max-w-[280px] sm:max-w-xs mx-auto leading-relaxed"
                    >
                      Track your nutrition instantly with AI. <br className="hidden sm:block" />
                      <span className="text-white font-medium block sm:inline mt-1">Your journey starts here.</span>
                    </motion.p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 pt-2">
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('login')}
                    className="w-full py-3.5 sm:py-4 px-6 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg shadow-[var(--primary)]/25 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Sign In
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </motion.button>
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('signup')}
                    className="w-full py-3.5 sm:py-4 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-colors"
                  >
                    Create Account
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Login View */}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="pt-8 sm:pt-4"
              >
                <BackButton />
                <div className="text-center mb-6 sm:mb-8 mt-2 sm:mt-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Welcome Back</h2>
                  <p className="text-sm sm:text-base text-[var(--text-muted)]">Sign in to continue your progress</p>
                </div>
                <LoginForm />
              </motion.div>
            )}

            {/* Signup View */}
            {view === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="pt-8 sm:pt-4"
              >
                <BackButton />
                <div className="text-center mb-6 sm:mb-8 mt-2 sm:mt-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Join FoodCal</h2>
                  <p className="text-sm sm:text-base text-[var(--text-muted)]">Start your fitness transformation today</p>
                </div>
                <SignupForm onSuccess={() => setView('login')} />
              </motion.div>
            )}
          </AnimatePresence>

        </Card>
      </div>
    </div>
  );
};
