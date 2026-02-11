'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion } from 'framer-motion';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

interface StepLog {
    id: string;
    log_date: string;
    steps: number;
    distance_km: number;
    calories_burned: number;
}

export default function StepHistoryPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const [logs, setLogs] = useState<StepLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchStepHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('step_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('log_date', { ascending: false })
                .limit(30); // Last 30 days

            if (data && !error) {
                setLogs(data);
            }
            setLoading(false);
        };

        fetchStepHistory();
    }, [user, supabase]);

    const totalSteps = logs.reduce((sum, log) => sum + log.steps, 0);
    const avgSteps = logs.length > 0 ? Math.round(totalSteps / logs.length) : 0;

    return (
        <div className="page-container space-y-8 max-w-4xl">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                            👟
                        </span>
                        Step History
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-2">
                        Your daily walking activity tracked over time
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                        <span className="block text-[var(--text-muted)] text-xs uppercase font-black mb-1">Total Steps</span>
                        <span className="text-2xl font-black text-[var(--primary)]">{totalSteps.toLocaleString()}</span>
                    </div>
                    <div className="glass-card p-4">
                        <span className="block text-[var(--text-muted)] text-xs uppercase font-black mb-1">Daily Average</span>
                        <span className="text-2xl font-black text-white">{avgSteps.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <section className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <span className="text-sm font-semibold">Recent Activity</span>
                </div>

                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="space-y-3 animate-pulse">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-white/5 rounded-2xl" />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl mb-4">
                                👟
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Step Data Yet</h3>
                            <p className="text-[var(--text-muted)] max-w-xs">
                                Start tracking your steps on the dashboard to see your activity history here!
                            </p>
                        </div>
                    ) : (
                        logs.map((log) => {
                            const date = new Date(log.log_date);
                            const isToday = log.log_date === new Date().toISOString().split('T')[0];
                            const progress = Math.min((log.steps / 10000) * 100, 100);

                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <CalendarDaysIcon className="w-5 h-5 text-[var(--primary)]" />
                                            <div>
                                                <h3 className="font-bold text-white">
                                                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                    {isToday && <span className="ml-2 text-xs text-[var(--primary)]">• Today</span>}
                                                </h3>
                                                <p className="text-xs text-[var(--text-muted)]">
                                                    {log.distance_km.toFixed(2)} km • {Math.round(log.calories_burned)} kcal burned
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black text-[var(--primary)]">
                                            {log.steps.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}
