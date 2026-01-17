import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { StatCard } from '@/components/dashboard/StatCard';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Mock Data for Display - In real app, fetch from DB
  const dailyStats = {
    calories: { current: 1250, target: 2200, unit: 'kcal' },
    protein: { current: 85, target: 150, unit: 'g' },
    carbs: { current: 120, target: 250, unit: 'g' },
    fats: { current: 45, target: 70, unit: 'g' },
  };

  const recentScans = [
    { id: 1, name: 'Avocado Toast', calories: 350, time: '08:30 AM', image: '🥑' },
    { id: 2, name: 'Grilled Chicken Salad', calories: 420, time: '01:15 PM', image: '🥗' },
    { id: 3, name: 'Protein Shake', calories: 180, time: '04:00 PM', image: '🥤' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Hello, <span className="text-[var(--primary)]">{userName}</span> 👋
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            You're on track! Keep up the momentum.
          </p>
        </div>
        <Link href={ROUTES.SCAN}>
          <button className="btn-primary flex items-center gap-2">
            <span className="text-xl">📷</span>
            Log Meal
          </button>
        </Link>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Calories"
          value={dailyStats.calories.current}
          unit={`/ ${dailyStats.calories.target} kcal`}
          icon="🔥"
          color="#ff4757"
          progress={(dailyStats.calories.current / dailyStats.calories.target) * 100}
        />
        <StatCard
          label="Protein"
          value={dailyStats.protein.current}
          unit={`/ ${dailyStats.protein.target} g`}
          icon="🥩"
          color="#00ff88"
          progress={(dailyStats.protein.current / dailyStats.protein.target) * 100}
        />
        <StatCard
          label="Carbs"
          value={dailyStats.carbs.current}
          unit={`/ ${dailyStats.carbs.target} g`}
          icon="🍞"
          color="#2f81f7"
          progress={(dailyStats.carbs.current / dailyStats.carbs.target) * 100}
        />
        <StatCard
          label="Fats"
          value={dailyStats.fats.current}
          unit={`/ ${dailyStats.fats.target} g`}
          icon="🥑"
          color="#bd34fe"
          progress={(dailyStats.fats.current / dailyStats.fats.target) * 100}
        />
      </section>

      {/* Main Content Split */}
      <section className="grid lg:grid-cols-3 gap-8">

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Link href={ROUTES.HISTORY} className="text-[var(--primary)] hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {recentScans.map((scan) => (
              <div key={scan.id} className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
                    {scan.image}
                  </div>
                  <div>
                    <h3 className="font-semibold">{scan.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{scan.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-[var(--primary)]">+{scan.calories}</span>
                  <span className="text-xs text-[var(--text-muted)]">kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips / Goals */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Daily Goals</h2>
          <div className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">💧</div>
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
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">💤</div>
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

          <div className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-6 bg-gradient-to-br from-[var(--primary)]/10 to-transparent">
            <h3 className="font-bold mb-2 text-[var(--primary)]">💡 Pro Tip</h3>
            <p className="text-sm text-gray-300">
              Eating protein with every meal helps maintain muscle mass and keeps you full longer.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}
