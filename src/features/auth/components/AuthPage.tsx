'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Card } from '@/components/ui/Card';
import { AppDemo, DEMO_STEPS } from '@/features/landing/components/AppDemo';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_ASSETS } from '@/lib/brand-config';
import { useAuth } from '../hooks/useAuth';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
  const router = useRouter();
  const supabase = createClient();

  const { user } = useAuth();

  const signInWithGoogle = async () => {
    // Robust origin detection: hardcode production URIs when not on localhost 
    // to ensure Supabase always matches its allow-list.
    const origin = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
      ? 'https://food-cal-fe-ewy4.vercel.app'
      : 'http://localhost:3000';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}`
      }
    })

    if (error) {
      console.error(error.message)
    }
  }


  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const BackButton = () => (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      whileHover={{ scale: 1.05, x: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => setView('landing')}
      className="mb-6 text-[var(--text-muted)] hover:text-white flex items-center gap-2 transition-colors group text-sm font-semibold py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md w-fit"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
        <path d="M19 12H5" /><path d="m12 19l-7-7 7-7" />
      </svg>
      Back
    </motion.button>
  );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col overflow-x-hidden selection:bg-[var(--primary)] selection:text-black">

      {/* Desktop Side-by-Side Context */}
      <main className="flex-1 flex flex-col lg:flex-row lg:min-h-screen relative">

        {/* Left Side: Branding & Premium Demo Context (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-16 relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_var(--primary)_0%,_transparent_25%),_radial-gradient(circle_at_bottom_right,_var(--secondary)_0%,_transparent_25%)]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div className="relative z-10 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <img src={BRAND_ASSETS.logo} className="w-12 h-12 object-contain rounded-xl shadow-xl" alt="" />
              <h2 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                {BRAND_ASSETS.name}
              </h2>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl xl:text-5xl font-black leading-tight tracking-tight"
              >
                Your Personal <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] via-white to-[var(--secondary)]">
                  AI Health Coach
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-400 max-w-md leading-relaxed"
              >
                {BRAND_ASSETS.tagline}. Optimized for your body, powered by intelligence.
              </motion.p>
            </div>

            {/* Feature Preview Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-xl">
              {DEMO_STEPS.slice(0, 4).map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-[var(--primary)]/30 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} p-2 mb-3 shadow-lg flex items-center justify-center text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 rounded-full border border-[var(--primary)]/20 animate-[pulse_8s_infinite]" />
            <div className="absolute inset-[100px] rounded-full border border-white/5 animate-[pulse_12s_infinite]" />
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:min-h-screen relative z-10 bg-black">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[440px] space-y-8"
          >
            {/* Mobile Branding Header */}
            <div className="lg:hidden flex flex-col items-center text-center space-y-4 mb-2 w-full relative">
              <img src={BRAND_ASSETS.logo} className="w-16 h-16 object-contain rounded-2xl shadow-2xl" alt="" />
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                {BRAND_ASSETS.name}
              </h1>
              <p className="text-[var(--text-muted)] text-sm max-w-xs">{BRAND_ASSETS.tagline}</p>

              {/* Mobile Quick Feature Preview */}
              {view === 'landing' && (
                <div className="grid grid-cols-2 gap-3 w-full px-4 mt-8 mb-4">
                  {DEMO_STEPS.slice(0, 4).map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center group"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} p-1.5 mb-2 shadow-lg flex items-center justify-center text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-[9px] uppercase tracking-widest text-gray-300">{step.title}</h4>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <Card className="p-8 sm:p-10 bg-[#111111]/80 backdrop-blur-2xl border border-white/10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] rounded-3xl relative overflow-visible ring-1 ring-white/5 w-full">
              <AnimatePresence mode="wait" initial={false}>
                {view === 'landing' && (
                  <motion.div
                    key="landing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Ready to start?</h2>
                      <p className="text-gray-500 text-sm">Create an account or sign in to track macros</p>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        onClick={() => setView('login')}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="w-full py-4 px-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-black text-lg rounded-2xl shadow-[0_10px_30px_-10px_#00ff8866] hover:shadow-[0_20px_40px_-10px_#00ff88aa] transition-all flex items-center justify-center gap-2"
                      >
                        Sign In
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                      </motion.button>
                      <motion.button
                        onClick={() => setView('signup')}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="w-full py-4 px-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold text-lg rounded-2xl transition-all"
                      >
                        Create Free Account
                      </motion.button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-[#111111] px-4 text-gray-500 font-bold tracking-widest">or</span>
                        </div>
                      </div>

                      <motion.button
                        onClick={signInWithGoogle}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="w-full py-4 px-6 bg-white text-black font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {view === 'login' && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <BackButton />
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black mb-2 text-white">Welcome Back</h2>
                      <p className="text-gray-500 text-sm">Sign in to your intelligent coach</p>
                    </div>
                    <LoginForm />

                    <div className="relative py-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#111111] px-4 text-gray-500 font-bold tracking-widest">or</span>
                      </div>
                    </div>

                    <motion.button
                      onClick={signInWithGoogle}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="w-full py-4 px-6 bg-white text-black font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl mb-4"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                    </motion.button>
                  </motion.div>
                )}

                {view === 'signup' && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <BackButton />
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black mb-2 text-white">Join {BRAND_ASSETS.name}</h2>
                      <p className="text-gray-500 text-sm">Your transformation starts today</p>
                    </div>
                    <SignupForm onSuccess={() => setView('login')} />

                    <div className="relative py-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#111111] px-4 text-gray-500 font-bold tracking-widest">or</span>
                      </div>
                    </div>

                    <motion.button
                      onClick={signInWithGoogle}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="w-full py-4 px-6 bg-white text-black font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl mb-4"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                    </motion.button>
                  </motion.div>
                )}


              </AnimatePresence>
            </Card>

            {/* Mobile Scroll Indicator */}
            {view === 'landing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="lg:hidden mt-12 flex flex-col items-center gap-3 text-gray-500 cursor-pointer group"
                onClick={() => {
                  document.getElementById('mobile-demo-anchor')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="text-[10px] uppercase tracking-[0.4em] font-black group-hover:text-[var(--primary)] transition-colors">Learn More</span>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover:text-[var(--primary)] group-hover:opacity-100 transition-all">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Backdrop for the whole right side on mobile */}
          <div className="lg:hidden absolute top-0 left-0 right-0 h-[1000px] bg-gradient-to-b from-[var(--primary)]/10 via-[var(--secondary)]/5 to-transparent -z-10 blur-[120px]" />
        </div>
      </main>

      {/* Mobile/Full Demo Section */}
      <div id="app-demo" className="w-full bg-[#080808] border-t border-white/10 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div id="mobile-demo-anchor" className="absolute -top-20" />
        <AppDemo />
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black/50 text-center">
        <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">
          © 2026 {BRAND_ASSETS.name} • Precision AI Nutrition
        </p>
      </footer>
    </div>
  );
};
