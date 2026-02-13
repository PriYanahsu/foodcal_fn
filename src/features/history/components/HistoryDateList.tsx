'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DailySummary } from '../types';
import Link from 'next/link';
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface DailyLog {
  created_at: string;
  calories: number;
}

export default function HistoryDateList() {
  const supabase = createClient();
  const { user } = useAuth();
  const [history, setHistory] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      const { data, error } = await supabase
        .from('food_logs')
        .select('created_at, calories')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
        return;
      }

      // Group by date
      const grouped = (data as DailyLog[]).reduce(
        (acc, curr) => {
          const date = new Date(curr.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
          if (!acc[date]) {
            acc[date] = { date, totalCalories: 0, mealCount: 0 };
          }
          acc[date].totalCalories += curr.calories || 0;
          acc[date].mealCount += 1;
          return acc;
        },
        {} as Record<string, DailySummary>
      );

      setHistory(Object.values(grouped));
      setLoading(false);
    }

    fetchHistory();
  }, [user, supabase]);

  if (loading) return <div className="text-center p-4">Loading history...</div>;

  if (history.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">No meal history found. Start tracking!</div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Meal History</h2>
      {history.map((day) => (
        <Link
          href={`/history/${day.date}`}
          key={day.date}
          className="block bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)] transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {new Date(day.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-sm text-gray-400">{day.mealCount} meals recorded</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="block font-bold text-[var(--primary)]">{day.totalCalories}</span>
                <span className="text-xs text-gray-500">kcal</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
