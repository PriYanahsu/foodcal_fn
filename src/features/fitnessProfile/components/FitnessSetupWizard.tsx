'use client';

import type { ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Spinner } from '@/components/ui/fc';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { useFitnessSetup } from '../hooks/useFitnessSetup';
import { AboutYouStep, ConsultStep, GoalStep, PlanStep, type AiPlan } from './wizard/WizardSteps';

const STEPS = [
  { title: 'About you', subtitle: 'Saved to your profile and used for every target.' },
  { title: 'Your goal', subtitle: 'Where you want to be, and by when.' },
  { title: 'Consult your coach', subtitle: 'One tap, and your plan is written.' },
  { title: 'Your plan', subtitle: 'Review it, then make it live.' },
];

const PRIMARY =
  'inline-flex h-12 flex-[2] items-center justify-center gap-2 rounded-2xl bg-brand text-base font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY =
  'inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-line-strong bg-surface-2 text-base font-bold text-fg transition-colors hover:bg-surface-3 disabled:opacity-50';

export default function FitnessSetupWizard({
  userId,
  onComplete,
  onCancel,
  isInline = false,
  headerAction,
  className = '',
}: {
  userId: string;
  onComplete: () => void;
  onCancel?: () => void;
  isInline?: boolean;
  /** Inline only: shown where the close button sits in the modal (e.g. "Skip for now"). */
  headerAction?: ReactNode;
  /** Inline only: extra classes for the card, e.g. to fill the screen on phones. */
  className?: string;
}) {
  const {
    step,
    setStep,
    loading,
    prefillLoading,
    aiResult,
    toast,
    clearToast,
    error,
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
  const plan = aiResult as AiPlan | null;
  const meta = STEPS[Math.min(step, STEPS.length) - 1];

  const header = (
    <header className="shrink-0 border-b border-line px-5 pb-4 pt-5 short:pb-3 short:pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption font-bold uppercase tracking-wide text-brand-ink">
            Step {step} of {STEPS.length}
          </p>
          <h2 className="mt-1 font-display text-title font-bold tracking-[-0.02em] text-fg">
            {meta.title}
          </h2>
          <p className="mt-0.5 text-footnote text-muted short:hidden">{meta.subtitle}</p>
        </div>
        {isInline && headerAction}
        {onCancel && !isInline && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close consultation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-2 transition-colors hover:text-fg active:scale-95"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-1.5 short:mt-3">
        {STEPS.map((s, i) => (
          <span
            key={s.title}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
              i < step ? 'bg-brand' : 'bg-surface-3'
            }`}
          />
        ))}
      </div>
    </header>
  );

  const body = (
    // Every step is laid out to fit a phone screen without scrolling; overflow stays on
    // only as a fallback for the on-screen keyboard and very small screens.
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 short:py-4">
      {step === 1 && (
        <AboutYouStep stats={stats} setStats={setStats} prefillLoading={prefillLoading} />
      )}
      {step === 2 && (
        <GoalStep
          stats={stats}
          goals={goals}
          setGoals={setGoals}
          setTargetWeight={setTargetWeight}
          isObjectiveAllowed={isObjectiveAllowed}
          derivedObjective={derivedObjective}
        />
      )}
      {step === 3 && <ConsultStep stats={stats} goals={goals} />}
      {step === 4 && plan && <PlanStep aiResult={plan} />}
    </div>
  );

  const footer = (
    <footer className="shrink-0 border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 short:pb-[max(1rem,env(safe-area-inset-bottom))] short:pt-3">
      {error && (
        <p
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-footnote text-fg"
        >
          <ExclamationCircleIcon className="mt-px h-4 w-4 shrink-0 text-warn" />
          {error}
        </p>
      )}
      <div className="flex gap-2">
        {step === 1 && (
          <button
            type="button"
            onClick={nextStep}
            disabled={prefillLoading || !canProceedStep1}
            className={PRIMARY}
          >
            Continue <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}

        {step === 2 && (
          <>
            <button type="button" onClick={prevStep} className={SECONDARY}>
              <ArrowLeftIcon className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceedStep2}
              className={PRIMARY}
            >
              Continue <ArrowRightIcon className="h-4 w-4" />
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <button type="button" onClick={prevStep} disabled={loading} className={SECONDARY}>
              <ArrowLeftIcon className="h-4 w-4" /> Back
            </button>
            <button type="button" onClick={handleConsultAI} disabled={loading} className={PRIMARY}>
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" /> Analysing…
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" /> Begin consultation
                </>
              )}
            </button>
          </>
        )}

        {step === 4 &&
          (plan?.status === 'approved' ? (
            <>
              <button type="button" onClick={() => setStep(2)} className={SECONDARY}>
                Change goals
              </button>
              <button type="button" onClick={handleSavePlan} disabled={loading} className={PRIMARY}>
                {loading && <Spinner className="h-4 w-4" />}
                {loading ? 'Saving…' : 'Activate my plan'}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setStep(2)} className={PRIMARY}>
              Adjust my goals
            </button>
          ))}
      </div>
    </footer>
  );

  const frame = (
    <>
      {header}
      {body}
      {footer}
    </>
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
        <section
          className={`flex w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-1 font-ui text-fg ${className}`}
        >
          {frame}
        </section>
        {feedback}
      </>
    );
  }

  // Phones: a full-screen flow, so the keyboard never squeezes the form into a strip.
  if (isPhone) {
    return (
      <>
        <div className="fixed inset-0 z-[100] flex flex-col bg-canvas font-ui text-fg">{frame}</div>
        {feedback}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--fc-scrim)] p-4 backdrop-blur-sm">
        <section className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-line bg-surface-1 font-ui text-fg shadow-[var(--fc-shadow-pop)]">
          {frame}
        </section>
      </div>
      {feedback}
    </>
  );
}
