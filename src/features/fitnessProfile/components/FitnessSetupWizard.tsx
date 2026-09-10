"use client";
import {
  UserIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { ACTIVITY_LEVELS } from '../utils/Constant';
import { useFitnessSetup } from '../hooks/useFitnessSetup';

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
  const {
    step,
    setStep,
    loading,
    prefillLoading,
    aiResult,
    toast,
    clearToast,
    stats,
    goals,
    setStats,
    setGoals,
    nextStep,
    prevStep,
    canProceedStep1,
    canProceedStep2,
    isObjectiveAllowed,
    derivedObjective,
    setTargetWeight,
    handleConsultAI,
    handleSavePlan
  } = useFitnessSetup(userId, onComplete);

  const inputClass =
    'w-full bg-[var(--surface)] border border-[var(--card-border)] px-3 py-2 sm:py-2.5 rounded-xl text-sm focus:border-[var(--primary)] outline-none';
  const labelClass =
    'block text-[10px] font-medium mb-1 text-[var(--text-muted)] uppercase tracking-wider';

  const WizardContent = (
    <div
      className={`bg-[var(--card-bg)] border border-[var(--card-border)] w-full rounded-2xl overflow-hidden shadow-xl relative animate-fade-in ${isInline ? '' : 'max-w-md mx-auto'
        }`}
    >
      {onCancel && !isInline && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 z-10 p-1.5 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-strong)] rounded-full transition-all"
          title="Cancel Consultation"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      <div className="h-1 w-full bg-[var(--surface)]">
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
              <div className="h-28 rounded-xl bg-[var(--surface)] animate-pulse" />
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
                        className={`flex-1 py-2 sm:py-2.5 rounded-xl border-2 text-sm transition-all ${stats.gender === g
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]'
                          : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--card-border)]'
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
                        className={`py-2 px-2 text-[11px] sm:text-xs rounded-xl border-2 transition-all text-left ${stats.activity_level === level
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]'
                          : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--card-border)]'
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
                        className={`py-2 sm:py-2.5 px-1 text-[11px] sm:text-xs rounded-xl border-2 transition-all leading-tight ${selected
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]'
                          : allowed
                            ? 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--card-border)]'
                            : 'border-[var(--card-border)] text-[var(--text-muted)] cursor-not-allowed opacity-40'
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
              <div className="text-left max-w-sm mx-auto rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 space-y-2">
                <p className="text-[11px] font-semibold text-[var(--foreground)]">What you&apos;ll get on your dashboard:</p>
                <ul className="space-y-1.5 text-[11px] text-[var(--text-muted)] leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-[var(--primary)] shrink-0">•</span>
                    <span>
                      <span className="text-[var(--foreground)] font-medium">Daily calorie target</span> — how much energy to eat for your goal
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--primary)] shrink-0">•</span>
                    <span>
                      <span className="text-[var(--foreground)] font-medium">Protein, carbs &amp; fats</span> — macro targets to hit each day
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--primary)] shrink-0">•</span>
                    <span>
                      <span className="text-[var(--foreground)] font-medium">Coach advice</span> — short tips tailored to your plan
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
                className="btn-primary py-2.5 sm:py-3 text-sm sm:text-base shadow-[0_0_20px_rgba(118,185,0,0.35)] disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Begin Consultation'}
              </button>
              {!loading && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-xs py-1"
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
              className={`p-3 sm:p-3.5 rounded-xl border ${aiResult.status === 'approved'
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
                }`}
            >
              <h3
                className={`text-base sm:text-lg font-bold mb-1 flex items-center gap-2 ${aiResult.status === 'approved' ? 'text-green-400' : 'text-red-400'
                  }`}
              >
                {aiResult.status === 'approved' ? (
                  <CheckCircleIcon className="w-5 h-5 shrink-0" />
                ) : (
                  <span>⚠️</span>
                )}
                {aiResult.status === 'approved' ? 'Your Plan is Ready!' : 'Reality Check Required'}
              </h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed italic">
                &ldquo;{aiResult.reasoning}&rdquo;
              </p>
            </div>

            {aiResult.status === 'approved' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--card-border)] text-center">
                    <span className="block text-[var(--primary)] text-lg font-bold">
                      {aiResult.targets.calories}
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase">Calories</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--card-border)] text-center">
                    <span className="block text-red-400 text-lg font-bold">
                      {aiResult.targets.protein}g
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase">Protein</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--card-border)] text-center">
                    <span className="block text-blue-400 text-lg font-bold">
                      {aiResult.targets.carbs}g
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase">Carbs</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--card-border)] text-center">
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
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{aiResult.advice}</p>
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
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
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
