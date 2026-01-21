'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStepTracker } from '../hooks/useStepTracker';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
// We use custom SVGs defined below instead of external icon libraries

export const StepTracker: React.FC = () => {
    const { steps, isTracking, requestPermission } = useStepTracker();
    const { user } = useAuth();

    // State for editable step goal
    const [stepGoal, setStepGoal] = useState(10000);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState(10000);

    // Load step goal from database on mount
    useEffect(() => {
        const loadStepGoal = async () => {
            if (!user) return;

            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_preferences')
                .select('step_goal')
                .eq('user_id', user.id)
                .single();

            if (data && data.step_goal) {
                setStepGoal(data.step_goal);
                setTempGoal(data.step_goal);
            }
        };

        loadStepGoal();
    }, [user]);

    // Save step goal to database
    const saveStepGoal = async () => {
        if (!user || tempGoal < 100) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: user.id,
                step_goal: tempGoal,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (!error) {
            setStepGoal(tempGoal);
            setIsEditingGoal(false);
        }
    };

    const progress = Math.min((steps / stepGoal) * 100, 100);

    return (
        <div className="glass-card p-6 relative overflow-hidden group">
            {/* Background Animation */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-all duration-700" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                            <FootprintsIcon className={`w-6 h-6 ${isTracking ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg tracking-tight">Daily Steps</h3>
                            <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">
                                Activity Tracker
                            </p>
                        </div>
                    </div>

                    {!isTracking && (
                        <button
                            onClick={requestPermission}
                            className="btn-primary py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                        >
                            <PlayIcon className="w-3 h-3 fill-current" />
                            Start Tracking
                        </button>
                    )}
                </div>

                {!isTracking && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                        <p className="text-xs text-orange-300 leading-relaxed">
                            📱 <strong>Mobile Device Required:</strong> Step tracking uses motion sensors only available on smartphones. Open this page on your phone to track steps.
                        </p>
                    </div>
                )}

                <div className="relative pt-4">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-4xl font-black text-white tabular-nums">
                            {steps.toLocaleString()}
                        </span>
                        {isEditingGoal ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempGoal}
                                    onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded-lg text-white text-right"
                                    min="100"
                                    max="100000"
                                />
                                <button
                                    onClick={saveStepGoal}
                                    className="text-[var(--primary)] text-xs font-bold hover:underline"
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingGoal(false);
                                        setTempGoal(stepGoal);
                                    }}
                                    className="text-gray-400 text-xs hover:underline"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingGoal(true)}
                                className="text-[var(--text-muted)] text-xs font-bold mb-1 hover:text-[var(--primary)] transition-colors flex items-center gap-1"
                            >
                                Goal: {stepGoal.toLocaleString()}
                                <span className="text-[10px]">✎</span>
                            </button>
                        )}
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="block text-[var(--text-muted)] text-[10px] uppercase font-black mb-1">Distance</span>
                        <span className="text-white font-bold">{(steps * 0.0007).toFixed(2)} <small className="text-gray-500 font-normal">km</small></span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="block text-[var(--text-muted)] text-[10px] uppercase font-black mb-1">Burned</span>
                        <span className="text-white font-bold">{(steps * 0.04).toFixed(0)} <small className="text-gray-500 font-normal">kcal</small></span>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2">
                    <div className="h-1 w-1 bg-[var(--primary)] rounded-full animate-ping" />
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                        {isTracking ? 'Smart tracking active' : 'Tracking paused'}
                    </span>
                </div>
            </div>

            {/* Locked Overlay if not tracking */}
            {!isTracking && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 hidden group-hover:flex items-center justify-center transition-all duration-500">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full shadow-2xl">
                        Click 'Start' to Activate
                    </span>
                </div>
            )}
        </div>
    );
};

// Simple FootprintsIcon component since we don't have Lucide
const FootprintsIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.5 1.89-4 4.5-4 2.1 0 3.3.7 4.5 2.5 1.2 1.8 1.5 2 2.5 2a3 3 0 0 1 2.5 1.5" />
        <path d="M14.5 18a4.5 4.5 0 0 1-5 0" />
        <path d="M12 21a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" />
    </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);
