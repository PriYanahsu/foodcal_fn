'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  UserIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SuccessToast } from '@/components/ui/SuccessToast';

interface Stats {
  gender: string;
  age: number | '';
  height: number | '';
  weight: number | '';
  activity_level: string;
}

interface Goals {
  objective: string;
  target_weight: number | '';
  target_date: string;
}

const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
] as const;

const EMPTY_STATS: Stats = {
  gender: '',
  age: '',
  height: '',
  weight: '',
  activity_level: '',
};

const EMPTY_GOALS: Goals = {
  objective: '',
  target_weight: '',
  target_date: '',
};

export default function FitnessSetupWizard({
  userId,
  onComplete,
  onCancel,
  isInline = false,
}: {
  userId: string;
  onComplete: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [aiResult, setAiResult] = useState<any>(null);
  const [toast, setToast] = useState<{
    message: string;
    detail?: string;
    actionLabel?: string;
    actionHref?: string;
  } | null>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [goals, setGoals] = useState<Goals>(EMPTY_GOALS);

  // Prefill from existing profile so Modify Plan shows real data (not demo 70/65)
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setPrefillLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select(
          'gender, age, height, weight, activity_level, goal, target_weight, target_date'
        )
        .eq('id', userId)
        .single();

      if (cancelled) return;

      if (data) {
        const weight = data.weight ?? '';
        const targetWeight = data.target_weight ?? '';
        let objective = data.goal || '';
        if (weight !== '' && targetWeight !== '') {
          if (weight > targetWeight) objective = 'Lose Weight';
          else if (weight < targetWeight) objective = 'Gain Muscle';
          else objective = 'Maintain Weight';
        }
        setStats({
          gender: data.gender || '',
          age: data.age ?? '',
          height: data.height ?? '',
          weight,
          activity_level: data.activity_level || '',
        });
        setGoals({
          objective,
          target_weight: targetWeight,
          target_date: data.target_date || '',
        });
      }
      setPrefillLoading(false);
    }

    if (userId) loadProfile();
    else setPrefillLoading(false);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const canProceedStep1 =
    !!stats.gender &&
    stats.age !== '' &&
    stats.height !== '' &&
    stats.weight !== '' &&
    !!stats.activity_level;

  const canProceedStep2 =
    !!goals.objective && goals.target_weight !== '' && !!goals.target_date;

  /** Derive goal from current vs target weight; lock other options */
  const derivedObjective = ((): string | null => {
    if (stats.weight === '' || goals.target_weight === '') return null;
    if (stats.weight > goals.target_weight) return 'Lose Weight';
    if (stats.weight < goals.target_weight) return 'Gain Muscle';
    return 'Maintain Weight';
  })();

  const isObjectiveAllowed = (o: string) => !derivedObjective || o === derivedObjective;

  const setTargetWeight = (value: number | '') => {
    const next = {
      ...goals,
      target_weight: value,
    };
    if (stats.weight !== '' && value !== '') {
      if (stats.weight > value) next.objective = 'Lose Weight';
      else if (stats.weight < value) next.objective = 'Gain Muscle';
      else next.objective = 'Maintain Weight';
    }
    setGoals(next);
  };

  const nextStep = () => {
    // Sync objective when entering goals step / moving forward with weights set
    if (step === 1 && stats.weight !== '' && goals.target_weight !== '') {
      const obj =
        stats.weight > goals.target_weight
          ? 'Lose Weight'
          : stats.weight < goals.target_weight
            ? 'Gain Muscle'
            : 'Maintain Weight';
      if (goals.objective !== obj) setGoals((g) => ({ ...g, objective: obj }));
    }
    setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const handleConsultAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fitness-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats, goals }),
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
        ai_coach_advice: aiResult.advice,
      })
      .eq('id', userId);

    if (!error) {
      setToast({
        message: 'Plan saved to Fitness Hub!',
        detail:
          'Your calorie, protein, carbs & fat targets are live. Check Fitness Hub & dashboard to track them.',
        actionLabel: 'Open Fitness Hub',
        actionHref: '/fitness',
      });
      window.setTimeout(() => {
        onComplete();
        router.refresh();
      }, 2400);
    } else {
      alert('Failed to save your plan. Please try again.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 px-3 py-2 sm:py-2.5 rounded-xl text-sm focus:border-[var(--primary)] outline-none';
  const labelClass =
    'block text-[10px] font-medium mb-1 text-[var(--text-muted)] uppercase tracking-wider';

  const WizardContent = (
    <div
      className={`bg-[var(--card-bg)] border border-[var(--card-border)] w-full rounded-2xl overflow-hidden shadow-xl relative animate-fade-in ${
        isInline ? '' : 'max-w-md mx-auto'
      }`}
    >
      {onCancel && !isInline && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 z-10 p-1.5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="Cancel Consultation"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      <div className="h-1 w-full bg-white/5">
        <div
          className="h-full bg-[var(--primary)] transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="p-4 sm:p-5">
        {step === 1 && (
          <div className="space-y-3.5 sm:space-y-4 animate-slide-up">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-1.5">
                <UserIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold leading-tight">Tell us about yourself</h2>
              <p className="text-[var(--text-muted)] text-xs">
                Physical stats help the AI set your base targets.
              </p>
            </div>

            {prefillLoading ? (
              <div className="h-28 rounded-xl bg-white/5 animate-pulse" />
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Gender</label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setStats({ ...stats, gender: g })}
                        className={`flex-1 py-2 sm:py-2.5 rounded-xl border-2 text-sm transition-all ${
                          stats.gender === g
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white'
                            : 'border-white/10 text-[var(--text-muted)] hover:border-white/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Age</label>
                  <input
                    type="number"
                    value={stats.age}
                    placeholder="Your age"
                    onChange={(e) =>
                      setStats({
                        ...stats,
                        age: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Height (cm)</label>
                  <input
                    type="number"
                    value={stats.height}
                    placeholder="e.g. 175"
                    onChange={(e) =>
                      setStats({
                        ...stats,
                        height: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stats.weight}
                    placeholder="Your current weight"
                    onChange={(e) =>
                      setStats({
                        ...stats,
                        weight: e.target.value === '' ? '' : parseFloat(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Activity Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITY_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setStats({ ...stats, activity_level: level })}
                        className={`py-2 px-2 text-[11px] sm:text-xs rounded-xl border-2 transition-all text-left ${
                          stats.activity_level === level
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white'
                            : 'border-white/10 text-[var(--text-muted)] hover:border-white/30'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={nextStep}
              disabled={prefillLoading || !canProceedStep1}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 disabled:opacity-40"
            >
              Next <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5 sm:space-y-4 animate-slide-up">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl flex items-center justify-center mx-auto mb-1.5">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold leading-tight">What&apos;s your goal?</h2>
              <p className="text-[var(--text-muted)] text-xs">
                Be specific about what you want to achieve.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <label className={labelClass}>Objective</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Lose Weight', 'Maintain Weight', 'Gain Muscle'].map((o) => {
                    const allowed = isObjectiveAllowed(o);
                    const selected = goals.objective === o;
                    return (
                      <button
                        key={o}
                        type="button"
                        disabled={!allowed}
                        onClick={() => {
                          if (!allowed) return;
                          setGoals({ ...goals, objective: o });
                        }}
                        title={
                          !allowed && derivedObjective
                            ? `Locked — based on your weight vs target, goal is ${derivedObjective}`
                            : undefined
                        }
                        className={`py-2 sm:py-2.5 px-1 text-[11px] sm:text-xs rounded-xl border-2 transition-all leading-tight ${
                          selected
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white'
                            : allowed
                              ? 'border-white/10 text-[var(--text-muted)] hover:border-white/30'
                              : 'border-white/5 text-white/20 cursor-not-allowed opacity-40'
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                {derivedObjective && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                    Auto-set from weight ({stats.weight} kg) → target ({goals.target_weight} kg)
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={goals.target_weight}
                    placeholder="Your goal weight"
                    onChange={(e) =>
                      setTargetWeight(
                        e.target.value === '' ? '' : parseFloat(e.target.value)
                      )
                    }
                    className={`${inputClass} focus:border-[var(--accent)]`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Target Date</label>
                  <input
                    type="date"
                    value={goals.target_date}
                    onChange={(e) => setGoals({ ...goals, target_date: e.target.value })}
                    className={`${inputClass} focus:border-[var(--accent)]`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={prevStep} className="btn-secondary flex-1 py-2.5 text-sm">
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceedStep2}
                className="btn-primary flex-[2] flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-40"
              >
                Next <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-1 animate-slide-up">
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full animate-ping" />
              <div className="relative bg-[var(--card-bg)] border-4 border-[var(--primary)] rounded-full w-full h-full flex items-center justify-center">
                <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary)] animate-pulse" />
              </div>
            </div>
            <div className="space-y-2.5">
              <h2 className="text-lg sm:text-xl font-bold leading-tight">Consulting Expert AI Coach</h2>
              <p className="text-[var(--text-muted)] text-xs max-w-sm mx-auto">
                Analyzing your stats & goals to build a plan that fits your body.
              </p>
              <div className="text-left max-w-sm mx-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                <p className="text-[11px] font-semibold text-white">What you&apos;ll get on your dashboard:</p>
                <ul className="space-y-1.5 text-[11px] text-[var(--text-muted)] leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-[var(--primary)] shrink-0">•</span>
                    <span>
                      <span className="text-white font-medium">Daily calorie target</span> — how much energy to eat for your goal
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--primary)] shrink-0">•</span>
                    <span>
                      <span className="text-white font-medium">Protein, carbs &amp; fats</span> — macro targets to hit each day
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--primary)] shrink-0">•</span>
                    <span>
                      <span className="text-white font-medium">Coach advice</span> — short tips tailored to your plan
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--primary)] shrink-0">•</span>
                    <span>
                      Log meals afterward and track progress against these targets in real time
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConsultAI}
                disabled={loading}
                className="btn-primary py-2.5 sm:py-3 text-sm sm:text-base shadow-[0_0_20px_rgba(0,255,136,0.35)] disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Begin Consultation'}
              </button>
              {!loading && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-[var(--text-muted)] hover:text-white transition-colors text-xs py-1"
                >
                  Go Back and Edit Goals
                </button>
              )}
            </div>
          </div>
        )}

        {step === 4 && aiResult && (
          <div className="space-y-3.5 sm:space-y-4 animate-slide-up">
            <div
              className={`p-3 sm:p-3.5 rounded-xl border ${
                aiResult.status === 'approved'
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <h3
                className={`text-base sm:text-lg font-bold mb-1 flex items-center gap-2 ${
                  aiResult.status === 'approved' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {aiResult.status === 'approved' ? (
                  <CheckCircleIcon className="w-5 h-5 shrink-0" />
                ) : (
                  <span>⚠️</span>
                )}
                {aiResult.status === 'approved' ? 'Your Plan is Ready!' : 'Reality Check Required'}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                &ldquo;{aiResult.reasoning}&rdquo;
              </p>
            </div>

            {aiResult.status === 'approved' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="block text-[var(--primary)] text-lg font-bold">
                      {aiResult.targets.calories}
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase">Calories</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="block text-red-400 text-lg font-bold">
                      {aiResult.targets.protein}g
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase">Protein</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="block text-blue-400 text-lg font-bold">
                      {aiResult.targets.carbs}g
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase">Carbs</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="block text-purple-400 text-lg font-bold">
                      {aiResult.targets.fats}g
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase">Fats</span>
                  </div>
                </div>

                <div className="bg-[var(--primary)]/5 p-3 rounded-xl border border-[var(--primary)]/20">
                  <h4 className="font-bold text-[var(--primary)] mb-1 flex items-center gap-1.5 text-xs">
                    <SparklesIcon className="w-3.5 h-3.5" /> Elite Coach Advice
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{aiResult.advice}</p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary flex-1 py-2.5 text-sm"
                  >
                    Change goals
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePlan}
                    disabled={loading}
                    className="btn-primary flex-[2] py-2.5 text-sm"
                  >
                    {loading ? 'Saving Plan...' : 'Activate My Plan'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-xs sm:text-sm text-gray-300">
                  Your AI coach suggests modifying your target date or weight for a healthier plan.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary py-2.5 px-6 text-sm"
                >
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
    return (
      <>
        {WizardContent}
        <SuccessToast
          message={toast?.message ?? null}
          detail={toast?.detail}
          actionLabel={toast?.actionLabel}
          actionHref={toast?.actionHref}
          onClose={clearToast}
          durationMs={2800}
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {WizardContent}
      <SuccessToast
        message={toast?.message ?? null}
        detail={toast?.detail}
        actionLabel={toast?.actionLabel}
        actionHref={toast?.actionHref}
        onClose={clearToast}
        durationMs={2800}
      />
    </div>
  );
}
