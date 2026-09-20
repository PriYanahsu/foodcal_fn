'use client';

import {
  UserIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Spinner } from '@/components/ui/fc';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { ACTIVITY_LEVELS } from '../utils/Constant';
import { useFitnessSetup } from '../hooks/useFitnessSetup';

const CONTROL =
  'h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-base text-fg outline-none transition-colors placeholder:text-muted focus:border-brand';
const LABEL = 'mb-1.5 block text-caption font-semibold text-muted';
const PRIMARY =
  'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-base font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY =
  'inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 text-base font-bold text-fg transition-colors hover:bg-surface-3 disabled:opacity-50';

/** One pill per step, filled up to the step you are on. */
function Progress({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
            n <= step ? 'bg-brand' : 'bg-surface-3'
          }`}
        />
      ))}
    </div>
  );
}

function StepHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-ink">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-bold leading-tight text-fg">{title}</h2>
        <p className="text-caption text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function Choice({
  selected,
  disabled = false,
  onClick,
  title,
  children,
  className = '',
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-11 items-center justify-center rounded-xl border px-2 text-center text-sm font-semibold leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-brand bg-brand/10 text-fg'
          : 'border-line bg-surface-2 text-muted hover:text-fg'
      } ${className}`}
    >
      {children}
    </button>
  );
}

const MACROS = [
  { key: 'calories', label: 'Calories', unit: '', tone: 'text-brand-ink' },
  { key: 'protein', label: 'Protein', unit: 'g', tone: 'text-protein' },
  { key: 'carbs', label: 'Carbs', unit: 'g', tone: 'text-carbs' },
  { key: 'fats', label: 'Fats', unit: 'g', tone: 'text-fat' },
] as const;

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
    handleSavePlan,
  } = useFitnessSetup(userId, onComplete);

  const isPhone = useMediaQuery(PHONE_QUERY);

  const content = (
    <section className="flex w-full flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 font-ui text-fg">
      <Progress step={step} />

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <StepHeading
            icon={<UserIcon className="h-5 w-5" />}
            title="Tell us about yourself"
            subtitle="Your stats set the base for every target."
          />

          {prefillLoading ? (
            <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <span className={LABEL}>Gender</span>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <Choice
                      key={g}
                      selected={stats.gender === g}
                      onClick={() => setStats({ ...stats, gender: g })}
                    >
                      {g}
                    </Choice>
                  ))}
                </div>
              </div>

              <label>
                <span className={LABEL}>Age</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={stats.age}
                  placeholder="28"
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      age: e.target.value === '' ? '' : parseInt(e.target.value),
                    })
                  }
                  className={CONTROL}
                />
              </label>

              <label>
                <span className={LABEL}>Height (cm)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={stats.height}
                  placeholder="175"
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      height: e.target.value === '' ? '' : parseInt(e.target.value),
                    })
                  }
                  className={CONTROL}
                />
              </label>

              <label className="col-span-2">
                <span className={LABEL}>Current weight (kg)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={stats.weight}
                  placeholder="72"
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      weight: e.target.value === '' ? '' : parseFloat(e.target.value),
                    })
                  }
                  className={CONTROL}
                />
              </label>

              <div className="col-span-2">
                <span className={LABEL}>Activity level</span>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_LEVELS.map((level) => (
                    <Choice
                      key={level}
                      selected={stats.activity_level === level}
                      onClick={() => setStats({ ...stats, activity_level: level })}
                    >
                      {level}
                    </Choice>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={nextStep}
            disabled={prefillLoading || !canProceedStep1}
            className={PRIMARY}
          >
            Next <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <StepHeading
            icon={<TrophyIcon className="h-5 w-5" />}
            title="What's your goal?"
            subtitle="Where you want to be, and by when."
          />

          <div>
            <span className={LABEL}>Objective</span>
            <div className="grid grid-cols-3 gap-2">
              {['Lose Weight', 'Maintain Weight', 'Gain Muscle'].map((o) => {
                const allowed = isObjectiveAllowed(o);
                return (
                  <Choice
                    key={o}
                    selected={goals.objective === o}
                    disabled={!allowed}
                    onClick={() => allowed && setGoals({ ...goals, objective: o })}
                    title={
                      !allowed && derivedObjective
                        ? `Locked — based on your weight vs target, your goal is ${derivedObjective}`
                        : undefined
                    }
                    className="text-caption"
                  >
                    {o}
                  </Choice>
                );
              })}
            </div>
            {derivedObjective && (
              <p className="mt-1.5 text-caption text-muted">
                Auto-set from {stats.weight} kg → {goals.target_weight} kg
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={LABEL}>Target weight (kg)</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={goals.target_weight}
                placeholder="68"
                onChange={(e) =>
                  setTargetWeight(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                className={CONTROL}
              />
            </label>
            <label>
              <span className={LABEL}>Target date</span>
              <input
                type="date"
                value={goals.target_date}
                onChange={(e) => setGoals({ ...goals, target_date: e.target.value })}
                className={CONTROL}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className={`${SECONDARY} flex-1`}>
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceedStep2}
              className={`${PRIMARY} flex-[2]`}
            >
              Next <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
              <span className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-brand bg-surface-2">
                <SparklesIcon className="h-7 w-7 text-brand-ink" />
              </span>
            </span>
            <div>
              <h2 className="text-lg font-bold leading-tight text-fg">Consult your AI coach</h2>
              <p className="mt-0.5 text-caption text-muted">
                It reads your stats and goal, then builds daily targets.
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-4 text-footnote text-fg-2">
            {[
              ['Daily calorie target', 'how much to eat for your goal'],
              ['Protein, carbs and fats', 'macro targets to hit each day'],
              ['Coach advice', 'short tips tailored to your plan'],
            ].map(([title, detail]) => (
              <li key={title} className="flex gap-2">
                <span className="mt-0.5 text-brand-ink">•</span>
                <span>
                  <span className="font-bold text-fg">{title}</span> — {detail}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={handleConsultAI} disabled={loading} className={PRIMARY}>
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Analysing…
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Begin consultation
                </>
              )}
            </button>
            {!loading && (
              <button
                type="button"
                onClick={prevStep}
                className="h-10 rounded-xl text-sm font-bold text-muted transition-colors hover:text-fg"
              >
                Go back and edit goals
              </button>
            )}
          </div>
        </div>
      )}

      {step === 4 && aiResult && (
        <div className="flex flex-col gap-4">
          <div
            className={`rounded-2xl border p-4 ${
              aiResult.status === 'approved'
                ? 'border-brand/30 bg-brand/10'
                : 'border-danger/40 bg-danger/10'
            }`}
          >
            <h3
              className={`flex items-center gap-2 text-base font-bold ${
                aiResult.status === 'approved' ? 'text-brand-ink' : 'text-danger'
              }`}
            >
              {aiResult.status === 'approved' ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
              )}
              {aiResult.status === 'approved' ? 'Your plan is ready' : 'Reality check'}
            </h3>
            <p className="mt-1 text-footnote leading-relaxed text-fg-2">{aiResult.reasoning}</p>
          </div>

          {aiResult.status === 'approved' ? (
            <>
              <div className="grid grid-cols-4 divide-x divide-line rounded-2xl border border-line bg-surface-2 py-2.5">
                {MACROS.map(({ key, label, unit, tone }) => (
                  <div key={key} className="flex min-w-0 flex-col items-center gap-0.5 px-1">
                    <span
                      className={`font-display text-[19px] font-bold leading-tight tabular-nums ${tone}`}
                    >
                      {aiResult.targets[key]}
                      {unit}
                    </span>
                    <span className="w-full truncate text-center text-caption font-medium text-muted">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-line bg-surface-2 p-4">
                <h4 className="flex items-center gap-1.5 text-footnote font-bold text-brand-ink">
                  <SparklesIcon className="h-4 w-4" /> Coach advice
                </h4>
                <p className="mt-1 text-footnote leading-relaxed text-fg-2">{aiResult.advice}</p>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button type="button" onClick={() => setStep(2)} className={`${SECONDARY} flex-1`}>
                  Change goals
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={loading}
                  className={`${PRIMARY} flex-[2]`}
                >
                  {loading && <Spinner className="h-4 w-4" />}
                  {loading ? 'Saving plan…' : 'Activate my plan'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 text-center">
              <p className="text-footnote text-muted">
                Your coach suggests moving the target date or weight for a healthier plan.
              </p>
              <button type="button" onClick={() => setStep(2)} className={PRIMARY}>
                Adjust my goals
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );

  const feedback = (
    <SuccessToast
      message={toast?.message ?? null}
      detail={toast?.detail}
      actionLabel={toast?.actionLabel}
      actionHref={toast?.actionHref}
      onClose={clearToast}
      durationMs={2800}
    />
  );

  if (isInline) {
    return (
      <>
        {content}
        {feedback}
      </>
    );
  }

  // Phones get the app's bottom sheet — same gesture as every other panel.
  if (isPhone) {
    return (
      <>
        <BottomSheet open onClose={() => onCancel?.()} label="AI consultation">
          {content}
        </BottomSheet>
        {feedback}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close consultation"
          className="fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-2 transition-colors hover:text-fg"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto overscroll-contain">
        {content}
      </div>
      {feedback}
    </div>
  );
}
