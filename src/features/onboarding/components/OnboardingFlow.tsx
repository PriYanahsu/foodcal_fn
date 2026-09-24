'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Logo } from '@/components/brand/Logo';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/userProfile';
import FitnessSetupWizard from '@/features/fitnessProfile/components/FitnessSetupWizard';
import { useOnboarding } from '../hooks/useOnboarding';
import WelcomeIntro from './WelcomeIntro';

type Stage = 'intro' | 'plan';

const STAGES: { id: Stage; label: string }[] = [
  { id: 'intro', label: 'Welcome' },
  { id: 'plan', label: 'Your plan' },
];

/** `?start=plan` skips the intro — used by the dashboard's "Set up my plan" buttons. */
export const START_PARAM = 'start';

function StageTrack({ stage, vertical = false }: { stage: Stage; vertical?: boolean }) {
  const current = STAGES.findIndex((s) => s.id === stage);
  return (
    <ol
      aria-label="Setup progress"
      className={vertical ? 'flex flex-col gap-4' : 'flex items-center gap-1.5 md:gap-4'}
    >
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={s.id}
            aria-current={active ? 'step' : undefined}
            className="flex items-center gap-2.5"
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                vertical ? 'h-8 w-8' : 'h-2 w-2 md:h-6 md:w-6'
              } ${
                done
                  ? 'bg-brand text-on-brand'
                  : active
                    ? 'bg-brand text-on-brand ring-4 ring-brand/20'
                    : 'bg-surface-3 text-muted'
              }`}
            >
              <span className={vertical ? '' : 'hidden md:inline'}>
                {done ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
            </span>
            <span
              className={`text-sm font-semibold ${active ? 'text-fg' : 'text-muted'} ${
                vertical ? '' : 'hidden lg:inline'
              }`}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * First-run flow at /welcome: intro → plan wizard → the dashboard.
 * Phones: every stage is exactly one screen (h-dvh), no page scroll.
 */
export default function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const { planKnown, hasPlan, markPlanActivated } = useOnboarding();
  const [stage, setStage] = useState<Stage>(
    searchParams.get(START_PARAM) === 'plan' ? 'plan' : 'intro'
  );

  // Someone who already has a plan has nothing to learn from the intro.
  useEffect(() => {
    if (planKnown && hasPlan && stage === 'intro') router.replace(ROUTES.HOME);
  }, [planKnown, hasPlan, stage, router]);

  const firstName = (profile.fullName || user?.name || '').split(' ')[0];

  // The plan can't be skipped: nothing in the app works without it. Logging out is the
  // only other way off this screen.
  const logOut = async () => {
    await logout();
    router.replace(ROUTES.LOGIN);
  };

  const logOutButton = (
    <button
      type="button"
      onClick={logOut}
      className="h-10 shrink-0 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      Log out
    </button>
  );

  return (
    <div className="flex h-dvh flex-col bg-canvas font-ui text-fg md:h-auto md:min-h-dvh">
      {/* On phones the wizard's own header carries Log out, so this bar steps aside for it. */}
      <header
        className={`flex h-14 shrink-0 items-center justify-between gap-3 px-4 md:h-20 md:px-8 ${
          stage === 'plan' ? 'max-md:hidden' : ''
        }`}
      >
        <Logo />
        <div className="flex items-center gap-3 md:gap-6">
          {/* The plan step shows the track in its side rail on large screens. */}
          <div className={stage === 'plan' ? 'lg:hidden' : ''}>
            <StageTrack stage={stage} />
          </div>
          {logOutButton}
        </div>
      </header>

      {stage === 'intro' && (
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:mx-auto md:w-full md:max-w-6xl md:justify-center md:px-8 md:pb-16">
          <WelcomeIntro firstName={firstName} onStart={() => setStage('plan')} />
        </div>
      )}

      {stage === 'plan' && user && (
        <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-5xl md:items-center md:justify-center md:px-8 md:pb-12 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-12">
          <aside className="hidden lg:flex lg:flex-col lg:gap-8 lg:pt-6">
            <StageTrack stage={stage} vertical />
            <div className="rounded-2xl border border-line bg-surface-1 p-4">
              <p className="text-sm font-bold text-fg">Why these questions?</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Your age, height, weight and activity set how much you burn each day. Your goal and
                date set how far to move from that. Nothing is shared outside your account.
              </p>
            </div>
            <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4">
              <p className="text-sm font-bold text-fg">This is your profile too</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Everything you answer here is saved to your profile, so you won&apos;t fill it in
                twice. Only your photo is left to add in Profile.
              </p>
            </div>
          </aside>
          <FitnessSetupWizard
            userId={user.id}
            isInline
            onComplete={() => {
              // Straight to the dashboard; it confirms the plan with one toast.
              markPlanActivated();
              router.replace(ROUTES.HOME);
            }}
            headerAction={<span className="shrink-0 md:hidden">{logOutButton}</span>}
            className="min-h-0 flex-1 max-md:rounded-none max-md:border-0 max-md:bg-canvas md:max-h-[min(780px,calc(100dvh-9rem))] md:max-w-lg md:flex-none lg:max-w-none"
          />
        </div>
      )}
    </div>
  );
}
