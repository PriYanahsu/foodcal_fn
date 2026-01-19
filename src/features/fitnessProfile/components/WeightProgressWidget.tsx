'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ScaleIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface WeightLog {
    weight: number;
    created_at: string;
}

export default function WeightProgressWidget({ userId, targetWeight }: { userId: string, targetWeight: number | null }) {
    const supabase = createClient();
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLogging, setIsLogging] = useState(false);
    const [newWeight, setNewWeight] = useState('');

    useEffect(() => {
        async function fetchLatestWeight() {
            setLoading(true);
            const { data, error } = await supabase
                .from('weight_logs')
                .select('weight')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                setCurrentWeight(data[0].weight);
            }
            setLoading(false);
        }

        if (userId) fetchLatestWeight();
    }, [userId]);

    const handleLogWeight = async () => {
        if (!newWeight || isNaN(parseFloat(newWeight))) return;

        setLoading(true);
        const { error } = await supabase
            .from('weight_logs')
            .insert({ user_id: userId, weight: parseFloat(newWeight) });

        if (!error) {
            setCurrentWeight(parseFloat(newWeight));
            setIsLogging(false);
            setNewWeight('');
        } else {
            alert('Failed to log weight');
        }
        setLoading(false);
    };

    if (!targetWeight && !currentWeight) return null;

    const progress = (currentWeight && targetWeight)
        ? Math.abs(currentWeight - targetWeight) // This is just a placeholder logic, simpler than real progress %
        : 0;

    return (
        <div className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <ScaleIcon className="w-5 h-5 text-[var(--accent)]" /> Weight Progress
                </h3>
                <button
                    onClick={() => setIsLogging(!isLogging)}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-white"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>

            {isLogging ? (
                <div className="flex gap-2 animate-slide-up">
                    <input
                        type="number"
                        step="0.1"
                        autoFocus
                        placeholder="kg"
                        value={newWeight}
                        onChange={e => setNewWeight(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-[var(--accent)]"
                    />
                    <button
                        onClick={handleLogWeight}
                        disabled={loading}
                        className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-medium">Current</span>
                            <div className="text-2xl font-bold tabular-nums">
                                {loading ? '...' : currentWeight ? `${currentWeight} kg` : '--'}
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-medium">Target</span>
                            <div className="text-xl font-semibold text-[var(--primary)] tabular-nums">
                                {targetWeight ? `${targetWeight} kg` : 'Not Set'}
                            </div>
                        </div>
                    </div>

                    {currentWeight && targetWeight && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-[var(--text-muted)]">Remaining</span>
                                <span className="font-bold text-white">{Math.abs(currentWeight - targetWeight).toFixed(1)} kg</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                {/* Simple indicator of how far we are. For now just 50% or something as placeholder */}
                                <div className="h-full bg-[var(--accent)] rounded-full w-1/2" />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
