import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface DailyStats {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface FoodLog {
    id: string;
    food_name: string;
    calories: number;
    created_at: string;
    meal_type: string;
}

export const useDailyStats = () => {
    const supabase = createClient();
    const [stats, setStats] = useState<DailyStats>({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });
    const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const fetchDailyStats = async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('food_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching daily stats:', error);
                setLoading(false);
                return;
            }

            // Aggregate totals
            const totals = data.reduce(
                (acc, log) => ({
                    calories: acc.calories + (log.calories || 0),
                    protein: acc.protein + (log.protein || 0),
                    carbs: acc.carbs + (log.carbs || 0),
                    fats: acc.fats + (log.fats || 0),
                }),
                { calories: 0, protein: 0, carbs: 0, fats: 0 }
            );

            setStats(totals);
            setRecentLogs(data.slice(0, 5)); // Get top 5 recent logs
            setLoading(false);
        };

        fetchDailyStats();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('daily_stats_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'food_logs', filter: `user_id=eq.${user.id}` },
                () => {
                    fetchDailyStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return { stats, recentLogs, loading };
};
