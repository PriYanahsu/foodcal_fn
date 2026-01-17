'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDailyStats } from '@/features/dashboard/hooks/useDailyStats';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, recentLogs, loading } = useDailyStats();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Goals (could be editable in future, hardcoded for now)
  const goals = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Hello, <span className="text-[var(--primary)]">{userName}</span> 👋
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            {loading ? 'Loading your stats...' : "You're on track! Keep up the momentum."}
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
      <section className="grid lg:grid-cols-3 gap-8">

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Link href={ROUTES.HISTORY} className="text-[var(--primary)] hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {recentLogs.length === 0 && !loading && (
              <div className="text-[var(--text-muted)] py-8 text-center bg-[var(--card-bg)]/50 rounded-2xl border border-[var(--card-border)] border-dashed">
                No meals logged today yet.
              </div>
            )}

            {recentLogs.map((log) => (
              <div key={log.id} className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
                    {/* Simple fallback icon based on meal type or generic */}
                    🍽️
                  </div>
                  <div>
                    <h3 className="font-semibold">{log.food_name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-[var(--primary)]">+{Math.round(log.calories)}</span>
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
