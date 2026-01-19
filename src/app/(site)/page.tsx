'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDaysIcon, CameraIcon } from '@heroicons/react/24/outline';
import AvatarUpload from '@/features/userProfile/components/AvatarUpload';
import { ROUTES } from '@/constants/routes';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDailyStats } from '@/features/dashboard/hooks/useDailyStats';
import { createClient } from '@/lib/supabase/client';
import FitnessSetupWizard from '@/features/fitnessProfile/components/setup/FitnessSetupWizard';
import WeightProgressWidget from '@/features/fitnessProfile/components/WeightProgressWidget';
import { SparklesIcon, TrophyIcon, ChevronRightIcon } from '@heroicons/react/24/outline';


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

  // State for the selected date filter
  // Initialize with today's date formatted as YYYY-MM-DD for the input
  // We use a safe default that doesn't rely on hydration-sensitive calculations if possible, 
  // but for the input 'value', YYYY-MM-DD is standard.
  // We will handle the display text separately.
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [mounted, setMounted] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // We now pass the string directly (with time component to ensure local start of day) 
  // to the updated hook which handles dependencies correctly.
  const { stats, recentLogs, loading } = useDailyStats(selectedDate + 'T00:00:00');
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [user]);

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Goals from profile or defaults
  const goals = {
    calories: profile?.daily_calorie_target || 2200,
    protein: profile?.daily_protein_target || 150,
    carbs: profile?.daily_carbs_target || 250,
    fats: profile?.daily_fats_target || 70,
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 md:space-y-10">

      {/* Hero Section */}
      <section className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 animate-fade-in-up">
        <div className="flex items-center gap-4 md:gap-6 w-full xl:w-auto">
          <div className="relative z-10 shrink-0">
            <AvatarUpload
              uid={user?.id || ''}
              url={profile?.avatar_url ?? null}
              isEditing={false}
              onUpload={(url) => {
                supabase.from('profiles').update({ avatar_url: url }).eq('id', user?.id).then();
                setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
              }}
              size={80} // Size might need to be responsive props if supported, but 80 is ok
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl xl:text-5xl font-bold">
              Hello, <span className="text-[var(--primary)]">{userName}</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm md:text-lg">
              {loading ? 'Loading your stats...' : profile?.goal ? `Goal: ${profile.goal}` : "Click 'Consult Coach' to set your targets."}
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row w-full xl:w-auto gap-4'>
          {!profile?.goal && (
            <button
              onClick={() => setShowWizard(true)}
              className="btn-secondary flex items-center justify-center gap-2 py-3 px-6 text-lg border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
            >
              <SparklesIcon className="w-6 h-6" />
              Consult Coach
            </button>
          )}
          <div className="w-full sm:w-auto relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)] pointer-events-none transition-colors group-hover:text-white z-10">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
            <input
              type="date"
              name="dateFilter"
              id="dateFilter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full sm:w-auto py-3 pl-12 pr-6 text-lg rounded-full border border-white/10 bg-white/5 backdrop-blur-md focus:border-[var(--primary)] focus:bg-white/10 focus:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all outline-none cursor-pointer appearance-none text-white hover:border-white/30 font-medium"
            />
          </div>
          <Link href={ROUTES.SCAN} className="w-full sm:w-auto">
            <button className="relative group overflow-hidden btn-primary flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-8 text-lg shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all border border-[var(--primary)]/50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out pointer-events-none" />
              <CameraIcon className="w-6 h-6" />
              <span className="font-bold tracking-wide">Log Meal</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Calories"
          value={Math.round(stats.calories)}
          unit={`/ ${goals.calories} kcal`}
          icon="🔥"
          color="#ff4757"
          progress={Math.min((stats.calories / goals.calories) * 100, 100)}
        />
        <StatCard
          label="Protein"
          value={Math.round(stats.protein)}
          unit={`/ ${goals.protein} g`}
          icon="🥩"
          color="#00ff88"
          progress={Math.min((stats.protein / goals.protein) * 100, 100)}
        />
        <StatCard
          label="Carbs"
          value={Math.round(stats.carbs)}
          unit={`/ ${goals.carbs} g`}
          icon="🍞"
          color="#2f81f7"
          progress={Math.min((stats.carbs / goals.carbs) * 100, 100)}
        />
        <StatCard
          label="Fats"
          value={Math.round(stats.fats)}
          unit={`/ ${goals.fats} g`}
          icon="🥑"
          color="#bd34fe"
          progress={Math.min((stats.fats / goals.fats) * 100, 100)}
        />
      </section>

      {/* Main Content Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            {/* Prevent hydration mismatch by only showing formatted date after mount */}
            <h2 className="text-xl md:text-2xl font-bold">
              Log for {mounted ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : '...'}
            </h2>
            <Link href={ROUTES.HISTORY} className="text-[var(--primary)] hover:underline text-sm md:text-base">View All History</Link>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              // Skeleton Loader to prevent flickering
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              // Premium Empty State
              <div className="flex flex-col items-center justify-center py-12 px-6 bg-[var(--card-bg)]/30 backdrop-blur-md rounded-3xl border border-[var(--card-border)] border-dashed">
                <div className="w-16 h-16 mb-4 rounded-full bg-[var(--card-bg)] flex items-center justify-center text-3xl shadow-inner">
                  📅
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">No Data Entered For This Day</h3>
                <p className="text-[var(--text-muted)] text-center max-w-sm mb-6">
                  It looks like you didn't log any meals on this date. Select another date or log a meal now!
                </p>
                {selectedDate === new Date().toLocaleDateString('en-CA') && (
                  <Link href={ROUTES.SCAN}>
                    <button className="px-6 py-2 bg-[var(--card-bg)] hover:bg-white/10 border border-white/10 rounded-full transition-colors font-medium">
                      Log a Meal Now
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              recentLogs.map((log) => {
                return (
                  <Link href={`/history/${new Date(log.created_at).toLocaleDateString('en-CA')}/${log.id}`} key={log.id}>
                    <div className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-800/50 group-hover:bg-gray-800 transition-colors flex items-center justify-center text-xl md:text-2xl overflow-hidden shrink-0">
                          {/* Simple fallback icon based on meal type or generic */}
                          🍽️
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate pr-2">{log.food_name}</h3>
                          <p className="text-xs md:text-sm text-[var(--text-muted)]">
                            {mounted ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block font-bold text-[var(--primary)] text-sm md:text-base">+{Math.round(log.calories)}</span>
                        <span className="text-xs text-[var(--text-muted)]">kcal</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Fitness Quick Link */}
        <div className="space-y-6">
          <Link href="/fitness" className="block group">
            <div className="bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/10 backdrop-blur-md border border-[var(--primary)]/30 rounded-2xl p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] transition-transform group-hover:rotate-12">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Fitness Hub</h3>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">AI Performance Coach</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-[var(--primary)] group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-300 line-clamp-2 italic">
                  "{profile?.ai_coach_advice || "Log more meals and update your weight to get personalized coaching tips."}"
                </p>
                {profile?.target_weight && (
                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                    <span className="text-[var(--text-muted)]">Target: {profile.target_weight}kg</span>
                    <span className="text-[var(--primary)] font-bold">View Progress</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          <h2 className="text-xl md:text-2xl font-bold">Daily Goals</h2>
          <div className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">💧</div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Water Intake</span>
                  <span className="text-sm text-[var(--text-muted)]">1.5 / 3 L</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/2"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">💤</div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Sleep</span>
                  <span className="text-sm text-[var(--text-muted)]">6 / 8 hrs</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showWizard && user && (
        <FitnessSetupWizard
          userId={user.id}
          onCancel={() => setShowWizard(false)}
          onComplete={() => {
            setShowWizard(false);
            window.location.reload(); // Refresh to show new targets
          }}
        />
      )}
    </div>
  );
}
