'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    CalendarDaysIcon,
    UserIcon,
    TrophyIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface Stats {
    gender: string;
    age: number;
    height: number;
    weight: number;
    activity_level: string;
}

interface Goals {
    objective: string;
    target_weight: number;
    target_date: string;
}

export default function FitnessSetupWizard({
    userId,
    onComplete,
    onCancel,
    isInline = false
}: {
    userId: string,
    onComplete: () => void,
    onCancel?: () => void,
    isInline?: boolean
}) {
    const supabase = createClient();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const [stats, setStats] = useState<Stats>({
        gender: 'Male',
        age: 25,
        height: 175,
        weight: 70,
        activity_level: 'Moderately Active'
    });

    const [goals, setGoals] = useState<Goals>({
        objective: 'Lose Weight',
        target_weight: 65,
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleConsultAI = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/fitness-consultant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stats, goals })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to consult AI coach');
            }

            setAiResult(result.data);
            setStep(4);
        } catch (error: any) {
            console.error('AI Consultation failed:', error);
            alert(`AI Consultation Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                gender: stats.gender,
                age: stats.age,
                height: stats.height,
                weight: stats.weight,
                activity_level: stats.activity_level,
                goal: goals.objective,
                target_weight: goals.target_weight,
                target_date: goals.target_date,
                daily_calorie_target: aiResult.targets.calories,
                daily_protein_target: aiResult.targets.protein,
                daily_carbs_target: aiResult.targets.carbs,
                daily_fats_target: aiResult.targets.fats,
                ai_coach_advice: aiResult.advice
            })
            .eq('id', userId);

        if (!error) {
            onComplete();
            router.refresh();
        } else {
            alert('Failed to save your plan. Please try again.');
        }
        setLoading(false);
    };

    const WizardContent = (
        <div className={`bg-[var(--card-bg)] border border-[var(--card-border)] w-full rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in ${isInline ? 'max-w-none' : 'max-w-2xl mx-auto'}`}>

            {/* Close/Back Button */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 z-10 p-2 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-full transition-all"
                    title="Cancel Consultation"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            )}

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-white/5">
                <div
                    className="h-full bg-[var(--primary)] transition-all duration-500"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            <div className="p-8 md:p-12">
                {step === 1 && (
                    <div className="space-y-8 animate-slide-up">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold">Tell us about yourself</h2>
                            <p className="text-[var(--text-muted)]">Your physical stats help the AI calculate your base targets.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)] uppercase tracking-wider">Gender</label>
                                <div className="flex gap-4">
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setStats({ ...stats, gender: g })}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all ${stats.gender === g ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white' : 'border-white/10 text-[var(--text-muted)] hover:border-white/30'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)] uppercase tracking-wider">Age</label>
                                <input
                                    type="number"
                                    value={stats.age}
                                    onChange={e => setStats({ ...stats, age: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--primary)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)] uppercase tracking-wider">Height (cm)</label>
                                <input
                                    type="number"
                                    value={stats.height}
                                    onChange={e => setStats({ ...stats, height: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--primary)] outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)] uppercase tracking-wider">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={stats.weight}
                                    onChange={e => setStats({ ...stats, weight: parseFloat(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--primary)] outline-none"
                                />
                            </div>
                        </div>

                        <button onClick={nextStep} className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
                            Next <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-slide-up">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <TrophyIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold">What's your goal?</h2>
                            <p className="text-[var(--text-muted)]">Be specific about what you want to achieve.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--text-muted)] uppercase tracking-wider">Objective</label>
                                <div className="flex gap-4">
                                    {['Lose Weight', 'Maintain Weight', 'Gain Muscle'].map(o => (
                                        <button
                                            key={o}
                                            onClick={() => setGoals({ ...goals, objective: o })}
                                            className={`flex-1 py-3 text-sm rounded-xl border-2 transition-all ${goals.objective === o ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white' : 'border-white/10 text-[var(--text-muted)] hover:border-white/30'}`}
                                        >
                                            {o}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-[var(--text-muted)] uppercase tracking-wider">Target Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={goals.target_weight}
                                        onChange={e => setGoals({ ...goals, target_weight: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--accent)] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-[var(--text-muted)] uppercase tracking-wider">Target Date</label>
                                    <input
                                        type="date"
                                        value={goals.target_date}
                                        onChange={e => setGoals({ ...goals, target_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--accent)] outline-none"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={prevStep} className="btn-secondary flex-1 py-3">Back</button>
                            <button onClick={nextStep} className="btn-primary flex-[2] flex items-center justify-center gap-2">
                                Next <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 text-center py-8 animate-slide-up">
                        <div className="relative mx-auto w-32 h-32">
                            <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full animate-ping" />
                            <div className="relative bg-[var(--card-bg)] border-4 border-[var(--primary)] rounded-full w-full h-full flex items-center justify-center">
                                <SparklesIcon className="w-16 h-16 text-[var(--primary)] animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Consulting Expert AI Coach</h2>
                            <p className="text-[var(--text-muted)] max-w-md mx-auto">
                                We're analyzing your data to create a feasible, healthy, and high-performance plan specifically for your body.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleConsultAI}
                                disabled={loading}
                                className="btn-primary py-4 text-xl shadow-[0_0_25px_rgba(0,255,136,0.4)] disabled:opacity-50"
                            >
                                {loading ? 'Analyzing...' : 'Begin Consultation'}
                            </button>
                            {!loading && <button onClick={prevStep} className="text-[var(--text-muted)] hover:text-white transition-colors">Go Back and Edit Goals</button>}
                        </div>
                    </div>
                )}

                {step === 4 && aiResult && (
                    <div className="space-y-8 animate-slide-up max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div className={`p-6 rounded-3xl border ${aiResult.status === 'approved' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <h3 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${aiResult.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                                {aiResult.status === 'approved' ? <CheckCircleIcon className="w-8 h-8" /> : '⚠️ Goal Needs Adjustment'}
                                {aiResult.status === 'approved' ? 'Your Plan is Ready!' : 'Reality Check Required'}
                            </h3>
                            <p className="text-gray-300 leading-relaxed italic">
                                "{aiResult.reasoning}"
                            </p>
                        </div>

                        {aiResult.status === 'approved' ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                                        <span className="block text-[var(--primary)] text-2xl font-bold">{aiResult.targets.calories}</span>
                                        <span className="text-[var(--text-muted)] text-xs uppercase tracking-tighter">Calories</span>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                                        <span className="block text-red-400 text-2xl font-bold">{aiResult.targets.protein}g</span>
                                        <span className="text-[var(--text-muted)] text-xs uppercase tracking-tighter">Protein</span>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                                        <span className="block text-blue-400 text-2xl font-bold">{aiResult.targets.carbs}g</span>
                                        <span className="text-[var(--text-muted)] text-xs uppercase tracking-tighter">Carbs</span>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                                        <span className="block text-purple-400 text-2xl font-bold">{aiResult.targets.fats}g</span>
                                        <span className="text-[var(--text-muted)] text-xs uppercase tracking-tighter">Fats</span>
                                    </div>
                                </div>

                                <div className="bg-[var(--primary)]/5 p-6 rounded-2xl border border-[var(--primary)]/20">
                                    <h4 className="font-bold text-[var(--primary)] mb-2 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5" /> Elite Coach Advice
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {aiResult.advice}
                                    </p>
                                </div>

                                <div className="flex gap-4 sticky bottom-0 bg-[var(--card-bg)] pt-4">
                                    <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-4">Wait, I want to change goals</button>
                                    <button onClick={handleSavePlan} disabled={loading} className="btn-primary flex-[2] py-4 text-xl">
                                        {loading ? 'Saving Plan...' : 'Activate My Plan'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6 text-center">
                                <p className="text-lg text-gray-300">
                                    Your AI coach suggests modifying your target date or target weight to ensure a healthy and sustainable transition.
                                </p>
                                <button onClick={() => setStep(2)} className="btn-primary py-4 px-12 text-lg">
                                    Adjust My Goals
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    if (isInline) {
        return WizardContent;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            {WizardContent}
        </div>
    );
}
