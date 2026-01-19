'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import WeightProgressWidget from '@/features/fitnessProfile/components/WeightProgressWidget';
import FitnessSetupWizard from '@/features/fitnessProfile/components/setup/FitnessSetupWizard';
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
        }
        setLoading(false);
    }

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
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-12 pb-20">
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
                    {/* Hero Header */}
                    <header className="relative py-12 px-8 rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent border border-[var(--card-border)] shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <TrophyIcon className="w-64 h-64 text-[var(--primary)]" />
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-semibold uppercase tracking-wider">
                                <SparklesIcon className="w-4 h-4" />
                                Elite AI Coaching Engaged
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                                Welcome to Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">Fitness Hub</span>
                            </h1>
                            <p className="text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed">
                                {profile?.goal
                                    ? `Currently working towards ${profile.goal.toLowerCase()} with an AI-optimized plan.`
                                    : "You haven't set an active fitness plan yet. Let's build your expert coaching profile."}
                            </p>

                            {!profile?.goal && (
                                <button
                                    onClick={() => setShowWizard(true)}
                                    className="mt-6 btn-primary px-8 py-4 text-lg shadow-[0_0_30px_#00ff8844]"
                                >
                                    Start AI Consultation
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Progress & Stats */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Weight Section */}
                            <section className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] rounded-3xl p-8 shadow-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold flex items-center gap-3">
                                        <ScaleIcon className="w-8 h-8 text-[var(--primary)]" />
                                        Weight Progression
                                    </h2>
                                </div>

                                {user && (
                                    <WeightProgressWidget
                                        userId={user.id}
                                        targetWeight={profile?.target_weight || null}
                                    />
                                )}
                            </section>

                            {/* Goals & Targets Grid */}
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[var(--card-bg)]/50 backdrop-blur-md border border-[var(--card-border)] rounded-3xl p-6 transition-all hover:bg-[var(--card-bg)] hover:border-[var(--primary)]/30 group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                            <FireIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Daily Calories</h3>
                                            <p className="text-sm text-[var(--text-muted)]">AI Targeted Intake</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black group-hover:text-[var(--primary)] transition-colors">
                                        {profile?.daily_calorie_target ? `${profile.daily_calorie_target} kcal` : '--'}
                                    </div>
                                </div>

                                <div className="bg-[var(--card-bg)]/50 backdrop-blur-md border border-[var(--card-border)] rounded-3xl p-6 transition-all hover:bg-[var(--card-bg)] hover:border-[var(--secondary)]/30 group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <CalendarIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Target Date</h3>
                                            <p className="text-sm text-[var(--text-muted)]">Roadmap Deadline</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black group-hover:text-[var(--secondary)] transition-colors">
                                        {profile?.target_date ? new Date(profile.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: AI Coach Advice & Profile Summary */}
                        <div className="space-y-8">
                            {/* AI Coach Sidebar Widget */}
                            <aside className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/5 to-[var(--card-bg)] border border-[var(--primary)]/30 rounded-3xl p-8 shadow-2xl glass-effect">
                                <div className="absolute -top-10 -right-10 opacity-10 blur-3xl w-40 h-40 bg-white rounded-full" />

                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3 text-[var(--primary)]">
                                        <SparklesIcon className="w-8 h-8 animate-pulse" />
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Expert Advice</h3>
                                    </div>

                                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                        <p className="text-white text-lg leading-relaxed italic">
                                            "{profile?.ai_coach_advice || "Set up your fitness profile to receive elite coaching strategies directed specifically at your objectives."}"
                                        </p>
                                    </div>

                                    {profile?.goal && (
                                        <button
                                            onClick={() => setShowWizard(true)}
                                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                        >
                                            <span className="font-semibold">Modify Active Plan</span>
                                            <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </aside>

                            {/* Profile Summary */}
                            <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] rounded-3xl p-8 space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <UserCircleIcon className="w-6 h-6" />
                                    Physical Profile
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        { label: 'Current Weight', value: `${profile?.weight || '--'} kg` },
                                        { label: 'Target Weight', value: `${profile?.target_weight || '--'} kg` },
                                        { label: 'Height', value: `${profile?.height || '--'} cm` },
                                        { label: 'Objective', value: profile?.goal || 'Not Set' },
                                    ].map((item, i) => (
                                        <li key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-[var(--text-muted)]">{item.label}</span>
                                            <span className="font-semibold text-white">{item.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
