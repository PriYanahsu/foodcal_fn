'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CameraIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LockClosedIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AvatarUpload from '@/features/userProfile/components/AvatarUpload';
import { ROUTES } from '@/constants/routes';
import { StatCard } from '@/components/dashboard/StatCard';
import { ThemeDatePicker } from '@/components/ui/ThemeDatePicker';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDailyStats } from '@/features/dashboard/hooks/useDailyStats';
import { createClient } from '@/lib/supabase/client';
import FitnessSetupWizard from '@/features/fitnessProfile/components/setup/FitnessSetupWizard';
import { StepTracker } from '@/features/activity/components/StepTracker';
import { isFeatureEnabled } from '@/config/features';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  daily_calorie_target: number | null;
  daily_protein_target: number | null;
  daily_carbs_target: number | null;
  daily_fats_target: number | null;
  ai_coach_advice: string | null;
  goal: string | null;
  target_weight: number | null;
}

export default function Dashboard() {
  const supabase = createClient();
  const { user } = useAuth();

  // Date State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [mounted, setMounted] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showNoPlanModal, setShowNoPlanModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { stats, recentLogs, loading } = useDailyStats(selectedDate + 'T00:00:00');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      setProfileLoading(true);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (data) {
        setProfile(data);
      }
      setProfileLoading(false);
    }

    fetchProfile();
  }, [user]);

  const userName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const hasPlan = !!profile?.goal;
  const goals = {
    calories: profile?.daily_calorie_target ?? null,
    protein: profile?.daily_protein_target ?? null,
    carbs: profile?.daily_carbs_target ?? null,
    fats: profile?.daily_fats_target ?? null,
  };

  // Gate first paint until profile + stats resolve — avoids lock→unlock flash.
  // Once ready, stay ready so date changes don't remount a full-page spinner.
  const [initialReady, setInitialReady] = useState(false);
  useEffect(() => {
    if (!profileLoading && !loading) setInitialReady(true);
  }, [profileLoading, loading]);

  // Only become a scroll container when the list actually overflows — otherwise
  // overflow:auto traps the wheel and page scroll feels dead/laggy.
  const dailyLogRef = useRef<HTMLDivElement>(null);
  const [logScrollable, setLogScrollable] = useState(false);

  useLayoutEffect(() => {
    const el = dailyLogRef.current;
    if (!el) return;

    const update = () => {
      setLogScrollable(el.scrollHeight > el.clientHeight + 1);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recentLogs, loading, selectedDate]);

  if (!initialReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  // Date Navigation Handlers
  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toLocaleDateString('en-CA'));
  };

  const isToday = selectedDate === new Date().toLocaleDateString('en-CA');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="page-container max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8 min-h-screen relative"
    >
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--primary)]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-3 sm:gap-6 lg:gap-8 mt-1 sm:mt-0"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full xl:w-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="shrink-0 rounded-full">
            <AvatarUpload
              uid={user?.id || ''}
              url={profile?.avatar_url ?? null}
              isEditing={false}
              onUpload={(url) => {
                supabase.from('profiles').update({ avatar_url: url }).eq('id', user?.id).then();
                setProfile((prev) => (prev ? { ...prev, avatar_url: url } : null));
              }}
              size={96}
            />
          </motion.div>
          <div className="text-center sm:text-left min-w-0 w-full sm:w-auto sm:flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--foreground)] mb-0.5 leading-tight">
              Hello, {userName}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] font-medium">
              {loading
                ? 'Crunching the numbers...'
                : profile?.goal
                  ? `Target: ${profile.goal}`
                  : "Let's hit your macro goals today."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full xl:w-auto">
          {/* Custom Date Navigator */}
          <div className="flex items-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-lg w-full sm:w-auto justify-between sm:justify-start relative z-30 h-10 sm:h-auto">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-1.5 sm:p-3 hover:bg-[var(--surface)] rounded-lg sm:rounded-xl transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)] shrink-0"
            >
              <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex-1 sm:flex-none">
              <ThemeDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                max={new Date().toLocaleDateString('en-CA')}
              />
            </div>

            <button
              onClick={() => handleDateChange(1)}
              disabled={isToday}
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-colors shrink-0 ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <Link href={ROUTES.SCAN}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-14 px-3 sm:px-8 rounded-xl sm:rounded-2xl transition-all w-full sm:w-auto"
            >
              <CameraIcon className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="font-black tracking-wide text-[11px] sm:text-base">LOG MEAL</span>
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <section
        className={`grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 relative ${!hasPlan ? 'cursor-pointer' : ''}`}
        onClick={!hasPlan ? () => setShowNoPlanModal(true) : undefined}
      >
        {!hasPlan && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px] border border-white/5">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-white/10 rounded-xl shadow-lg">
              <LockClosedIcon className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-bold text-[var(--foreground)]">Set up your AI plan to unlock</span>
            </div>
          </div>
        )}
        <StatCard
          label="Calories"
          value={hasPlan ? Math.round(stats.calories) : '--'}
          unit={hasPlan && goals.calories ? `/ ${goals.calories}` : ''}
          icon="🔥"
          color="#ff4757"
          progress={hasPlan && goals.calories ? Math.min((stats.calories / goals.calories) * 100, 100) : undefined}
          delay={0.1}
        />
        <StatCard
          label="Protein"
          value={hasPlan ? Math.round(stats.protein) : '--'}
          unit={hasPlan && goals.protein ? `/ ${goals.protein}g` : ''}
          icon="🥩"
          color="#00ff88"
          progress={hasPlan && goals.protein ? Math.min((stats.protein / goals.protein) * 100, 100) : undefined}
          delay={0.2}
        />
        <StatCard
          label="Carbs"
          value={hasPlan ? Math.round(stats.carbs) : '--'}
          unit={hasPlan && goals.carbs ? `/ ${goals.carbs}g` : ''}
          icon="🍞"
          color="#2f81f7"
          progress={hasPlan && goals.carbs ? Math.min((stats.carbs / goals.carbs) * 100, 100) : undefined}
          delay={0.3}
        />
        <StatCard
          label="Fats"
          value={hasPlan ? Math.round(stats.fats) : '--'}
          unit={hasPlan && goals.fats ? `/ ${goals.fats}g` : ''}
          icon="🥑"
          color="#bd34fe"
          progress={hasPlan && goals.fats ? Math.min((stats.fats / goals.fats) * 100, 100) : undefined}
          delay={0.4}
        />
      </section>

      {/* Main Content Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2 min-w-0">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-2 px-3.5 py-3 sm:px-5 sm:py-4 border-b border-[var(--card-border)] shrink-0 bg-[var(--card-bg)] rounded-t-2xl sm:rounded-t-3xl">
              <h2 className="text-base sm:text-xl font-bold flex items-center gap-2 text-[var(--foreground)]">
                Daily Log
                <span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)] bg-[var(--surface)] px-1.5 sm:px-2 py-0.5 rounded-md border border-[var(--card-border)]">
                  {recentLogs.length} Items
                </span>
              </h2>
              <Link
                href={ROUTES.HISTORY}
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-xs sm:text-sm font-bold flex items-center gap-1 group"
              >
                Full History
                <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div
              ref={dailyLogRef}
              className={`max-h-[360px] sm:max-h-[460px] p-2.5 sm:p-4 space-y-2 sm:space-y-3 rounded-b-2xl sm:rounded-b-3xl ${
                logScrollable ? 'overflow-y-auto' : 'overflow-y-visible'
              }`}
            >
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 sm:h-20 bg-[var(--surface)] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-4 text-center min-h-[240px]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 rounded-full bg-[var(--surface)] flex items-center justify-center text-2xl sm:text-3xl border border-[var(--card-border)]">
                    🍽️
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1.5 text-[var(--foreground)]">Empty Plate?</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-sm mb-5">
                    You haven&apos;t logged any meals for this day yet.
                    {isToday
                      ? ' Start tracking now to hit your goals!'
                      : ' Select another date to view history.'}
                  </p>
                  {isToday && (
                    <Link href={ROUTES.SCAN}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2.5 text-sm bg-[var(--primary)] text-black font-bold rounded-xl"
                      >
                        Scan First Meal
                      </motion.button>
                    </Link>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {recentLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.24) }}
                    >
                      <Link
                        href={`/history/${new Date(log.created_at).toLocaleDateString('en-CA')}/${log.id}`}
                      >
                        <div className="bg-[var(--surface)] hover:bg-[var(--surface-strong)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-5 transition-all group">
                          <div className="flex items-center gap-2.5 sm:gap-5 flex-1 min-w-0">
                            <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-[var(--card-bg)] group-hover:bg-[var(--primary)]/10 transition-all flex items-center justify-center text-base sm:text-2xl border border-[var(--card-border)] group-hover:border-[var(--primary)]/20 shrink-0">
                              🥗
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-[13px] sm:text-lg leading-snug line-clamp-2 text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                {log.food_name}
                              </h3>
                              <p className="text-[10px] sm:text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                <span>
                                  {mounted
                                    ? new Date(log.created_at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                    : ''}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] shrink-0" />
                                <span className="truncate">{Math.round(log.protein)}g Protein</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 bg-[var(--card-bg)] border border-[var(--card-border)] px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl">
                            <span className="block font-black text-sm sm:text-xl text-[var(--primary)] leading-none">
                              +{Math.round(log.calories)}
                            </span>
                            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                              kcal
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
          {/* Fitness Hub Card */}
          <Link href="/fitness" className="block group">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all hover:scale-[1.02] hover:border-[var(--primary)]/40 isolate">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[50px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-black flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-[var(--foreground)]">Fitness Hub</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${hasPlan ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                      {hasPlan ? 'AI Coach Active' : 'No plan yet'}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center group-hover:bg-[var(--surface-strong)] transition-colors">
                  <ChevronRightIcon className="w-4 h-4 text-[var(--foreground)]" />
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[var(--card-border)] mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-[var(--text-muted)] italic leading-relaxed">
                  "{profile?.ai_coach_advice || 'Log more meals to unlock personalized insights.'}"
                </p>
              </div>

              {profile?.target_weight && (
                <div className="flex justify-between items-center text-xs font-medium text-[var(--text-muted)]">
                  <span>Target: {profile.target_weight}kg</span>
                  <span className="text-[var(--foreground)] group-hover:underline group-hover:text-[var(--primary)]">View Progress</span>
                </div>
              )}
            </div>
          </Link>

          {isFeatureEnabled('steps') && <StepTracker />}

          {/* Quick Goals */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6">
            <h3 className="font-bold text-base sm:text-lg text-[var(--foreground)]">Daily Habits</h3>

            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-sm sm:text-base shrink-0">
                  🌊
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-bold text-sm text-[var(--foreground)]">Hydration</span>
                    <span className="text-xs font-medium text-[var(--primary)]">1.5 / 3 L</span>
                  </div>
                  <div className="w-full bg-[var(--surface-strong)] h-2.5 rounded-full overflow-hidden border border-[var(--card-border)]">
                    <div className="h-full bg-[var(--primary)] w-1/2 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-sm sm:text-base shrink-0">
                  💤
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-[var(--foreground)]">Sleep</span>
                    <span className="text-[10px] sm:text-xs font-medium text-[var(--primary)]">6 / 8 hrs</span>
                  </div>
                  <div className="w-full bg-[var(--surface-strong)] h-2.5 rounded-full overflow-hidden border border-[var(--card-border)]">
                    <div className="h-full bg-[var(--primary)] w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {showWizard && user && (
        <FitnessSetupWizard
          userId={user.id}
          onCancel={() => setShowWizard(false)}
          onComplete={() => {
            setShowWizard(false);
            window.location.reload();
          }}
        />
      )}

      {/* No Plan Modal */}
      <AnimatePresence>
        {showNoPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowNoPlanModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[var(--card-bg)] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowNoPlanModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                  <LockClosedIcon className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <h2 className="text-xl font-black text-white">Unlock Your Nutrition Targets</h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your calorie, protein, carbs, and fat targets are locked until you complete a quick{' '}
                  <span className="text-white font-semibold">AI plan consultation</span>. It takes under 2 minutes.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 opacity-40 select-none pointer-events-none">
                {[
                  { label: 'Cal', icon: '🔥' },
                  { label: 'Protein', icon: '🥩' },
                  { label: 'Carbs', icon: '🍞' },
                  { label: 'Fats', icon: '🥑' },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
                    <div className="text-base mb-1">{m.icon}</div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">{m.label}</p>
                    <p className="text-sm font-black text-white/30">--</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <Link href="/fitness" onClick={() => setShowNoPlanModal(false)}>
                  <button className="w-full btn-primary py-3 text-sm font-bold rounded-xl shadow-[0_0_20px_#00ff8833] hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    Start AI Plan Consultation
                  </button>
                </Link>
                <button
                  onClick={() => setShowNoPlanModal(false)}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-white transition-colors font-medium"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
