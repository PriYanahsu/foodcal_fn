'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MealLog } from '../types';
import Link from 'next/link';
import { ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface DailyMealListProps {
  date: string;
}

export default function DailyMealList({ date }: DailyMealListProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeals() {
      if (!user) return;

      // Date filtering: Start of day to End of day in UTC?
      // Better to rely on the date string passed which should be in local or specific format.
      // But Supabase stores in UTC.
      // Use the date string "YYYY-MM-DD" and filter by string comparison if possible or range.
      // Simplest for now: Fetch all for user, filter in JS (inefficient but safe for timezone mess initially),
      // OR use PostgreSQL date operator.

      // Let's rely on the date passed being YYYY-MM-DD.
      // Parse YYYY-MM-DD to local midnight
      const [year, month, day] = date.split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(year, month - 1, day);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: true }); // Breakfast first? Or chronological.

      if (error) {
        console.error('Error fetching meals:', error);
      } else if (data) {
        setMeals(data as MealLog[]);
      }
      setLoading(false);
    }

    fetchMeals();
  }, [user, date, supabase]);

  if (loading) return <div>Loading meals...</div>;
  if (meals.length === 0) return <div>No meals found for this date.</div>;

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <Link
          href={`/history/${date}/${meal.id}`}
          key={meal.id}
          className="block bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)] transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Time */}
              <div className="text-sm text-gray-500 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {new Date(meal.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              <div>
                <h3 className="font-semibold">{meal.food_name}</h3>
                <p className="text-xs text-gray-400 capitalize">{meal.meal_type}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center text-[var(--primary)] font-bold">
                <FireIcon className="h-4 w-4 mr-1" />
                {meal.calories}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
