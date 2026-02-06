'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import WeightProgressWidget from '@/features/fitnessProfile/components/WeightProgressWidget';
import FitnessSetupWizard from '@/features/fitnessProfile/components/setup/FitnessSetupWizard';
import { StatCard } from '@/components/dashboard/StatCard';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import {
    SparklesIcon,
    TrophyIcon,
    ScaleIcon,
    FireIcon,
    CalendarIcon,
    UserCircleIcon,
    ChevronRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
    target_date: string | null;
    weight: number | null;
    height: number | null;
    gender: string | null;
    age: number | null;
    activity_level: string | null;
}

export default function FitnessHub() {
    const supabase = createClient();
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [loading, setLoading] = useState(true);

    async function fetchProfile() {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) {
            setProfile(data);

            // Only show reminder if profile is not complete
            const completion = calculateProfileCompletion(data);
            if (completion < 100) {
                setShowReminder(true);
            }
        }
        setLoading(false);
    }

    const completionPercentage = calculateProfileCompletion(profile);
    const [showReminder, setShowReminder] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="px-4 pb-4 md:px-8 md:pb-8 lg:px-12 lg:pb-12 pt-2 md:pt-4 lg:pt-6 max-w-7xl mx-auto space-y-12 pb-20">
            {showReminder && (
                <div className="animate-slide-up">
                    <div className="bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                                <FireIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">Profile Incomplete ({completionPercentage}%)</p>
                                <p className="text-[var(--text-muted)] text-xs">For maximum AI accuracy, please ensure all profile details are set.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowReminder(false)}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {showWizard && user ? (
                <section className="animate-fade-in space-y-8">
                    <div className="flex items-center justify-between bg-[var(--card-bg)]/50 p-6 rounded-2xl border border-[var(--card-border)]">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black">AI Plan <span className="text-[var(--primary)]">Consultation</span></h2>
                            <p className="text-[var(--text-muted)] text-sm">Fine-tune your fitness objectives with our expert AI coach.</p>
                        </div>
                        <button
                            onClick={() => setShowWizard(false)}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-[var(--text-muted)] hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all"
                        >
                            <XMarkIcon className="w-5 h-5" /> Cancel Consultation
                        </button>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <FitnessSetupWizard
                            userId={user.id}
                            isInline={true}
                            onCancel={() => setShowWizard(false)}
                            onComplete={() => {
                                setShowWizard(false);
                                fetchProfile();
                            }}
                        />
                    </div>
                </section>
            ) : (
                <>
                    {/* Compact Hero Header */}
                    <header className="relative py-8 md:py-10 px-8 rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent border border-[var(--card-border)] shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <TrophyIcon className="w-40 h-40 text-[var(--primary)]" />
                        </div>

                        <div className="relative z-10 space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest">
                                <SparklesIcon className="w-3 h-3" />
                                Elite AI Coaching Active
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                                Fitness <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] font-outline-2">Hub</span>
                            </h1>
                            <p className="text-lg text-[var(--text-muted)] max-w-xl leading-relaxed font-medium">
                                {profile?.goal
                                    ? `Optimizing for ${profile.goal.toLowerCase()} with AI precision.`
                                    : "Build your expert coaching profile to begin."}
                            </p>

                            {!profile?.goal && (
                                <button
                                    onClick={() => setShowWizard(true)}
                                    className="mt-4 btn-primary px-6 py-3 text-base shadow-[0_0_20px_#00ff8822]"
                                >
                                    Start AI Consultation
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Main Layout Grid */}
                    <div className="space-y-10">
                        {/* 1. Expert Coaching (Sleek Strategy Card) */}
                        <aside className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card-bg)] to-transparent border border-[var(--primary)]/20 rounded-3xl p-6 md:p-8 shadow-lg group">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                <SparklesIcon className="w-32 h-32 text-[var(--primary)]" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 text-[var(--primary)]">
                                        <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                                            <SparklesIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">Expert Strategy</h3>
                                            <p className="text-[10px] text-[var(--text-muted)] font-bold tracking-[0.2em]">PRO TIPS • ACTIVE PLAN</p>
                                        </div>
                                    </div>

                                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                        <p className="text-white text-lg leading-snug font-medium italic opacity-90">
                                            "{profile?.ai_coach_advice || "Log more data to unlock expert coaching strategies."}"
                                        </p>
                                    </div>
                                </div>

                                {profile?.goal && (
                                    <button
                                        onClick={() => setShowWizard(true)}
                                        className="w-full md:w-auto flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/btn"
                                    >
                                        <span className="font-bold text-sm tracking-tight whitespace-nowrap">Modify Plan</span>
                                        <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </aside>

                        {/* 2. Dashboard Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Stats & Progression Column */}
                            <div className="lg:col-span-3 space-y-8">
                                {/* Compact Stat Cards Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCard
                                        label="Daily Calories"
                                        value={profile?.daily_calorie_target || '--'}
                                        unit="kcal"
                                        icon="🔥"
                                        color="var(--primary)"
                                    />
                                    <StatCard
                                        label="Protein Goal"
                                        value={profile?.daily_protein_target || '--'}
                                        unit="g"
                                        icon="🥩"
                                        color="#2196f3"
                                    />
                                    <StatCard
                                        label="Target Weight"
                                        value={profile?.target_weight || '--'}
                                        unit="kg"
                                        icon="🎯"
                                        color="#ff9800"
                                    />
                                </div>

                                {/* Weight Section */}
                                <section className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                                        <ScaleIcon className="w-48 h-48 text-[var(--primary)]" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                                <ScaleIcon className="w-8 h-8 text-[var(--primary)]" />
                                                Progression Tracking
                                            </h2>
                                        </div>

                                        {user && (
                                            <WeightProgressWidget
                                                userId={user.id}
                                                targetWeight={profile?.target_weight || null}
                                                onLogSuccess={fetchProfile}
                                            />
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Info Side Column */}
                            <div className="space-y-8">
                                {/* Physical Profile Summary */}
                                <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] rounded-3xl p-8 space-y-6 shadow-lg">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <UserCircleIcon className="w-6 h-6 text-[var(--primary)]" />
                                        Physical Data
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            { label: 'Current Weight', value: `${profile?.weight || '--'} kg`, icon: ScaleIcon },
                                            { label: 'Target Weight', value: `${profile?.target_weight || '--'} kg`, icon: TrophyIcon },
                                            { label: 'Height', value: `${profile?.height || '--'} cm`, icon: ScaleIcon },
                                            { label: 'Objective', value: profile?.goal || 'Not Set', icon: SparklesIcon },
                                        ].map((item, i) => (
                                            <li key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0 group/stat">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-lg bg-white/5 text-[var(--text-muted)] group-hover/stat:text-[var(--primary)] transition-colors">
                                                        <item.icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[var(--text-muted)] text-sm font-medium">{item.label}</span>
                                                </div>
                                                <span className="font-bold text-white text-sm group-hover/stat:text-[var(--primary)] transition-colors">{item.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Target Date Box */}
                                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-3xl p-6 shadow-md group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest text-blue-400">Roadmap</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-[var(--text-muted)]">Goal Completion Date</p>
                                        <p className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tabular-nums">
                                            {profile?.target_date ? new Date(profile.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Setting...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
