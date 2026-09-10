'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import WeightProgressWidget from '@/features/fitnessProfile/components/WeightProgressWidget';
import FitnessSetupWizard from '@/features/fitnessProfile/components/FitnessSetupWizard';
import { StatCard } from '@/components/dashboard/StatCard';
import CollapsibleSection from './CollapsibleSection';
import {
  SparklesIcon,
  TrophyIcon,
  ScaleIcon,
  FireIcon,
  CalendarIcon,
  UserCircleIcon,
  ChevronRightIcon,
  XMarkIcon,
  BoltIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useFitnessHub } from '../hooks/useFitnessHub';

export default function FitnessHub() {
  const { user } = useAuth();
  const {
    fitnessProfile,
    showWizard,
    setShowWizard,
    loading,
    showReminder,
    setShowReminder,
    completionPercentage,
    bmi,
    daysLeft,
    weightDelta,
    fetchFitnessProfile,
  } = useFitnessHub(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div
      className={`page-container max-w-7xl space-y-3 sm:space-y-4 lg:space-y-4 ${
        showWizard ? 'pb-4 lg:pb-3' : 'pb-24 lg:pb-6'
      }`}
    >
      {showReminder && (
        <div className="animate-slide-up">
          <div className="bg-gradient-to-r from-orange-500/20 to-transparent border border-orange-500/30 p-3 rounded-xl flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 shrink-0">
                <FireIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[var(--foreground)] text-xs">
                  Profile Incomplete ({completionPercentage}%)
                </p>
                <p className="text-[var(--text-muted)] text-[10px] truncate">
                  Complete your profile for maximum AI accuracy.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowReminder(false)}
              className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top row: Fitness Hub always stays — right side swaps to plan wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 lg:items-start">
        {/* Fitness Hub — always present */}
        <header className="relative py-4 px-4 sm:py-5 sm:px-5 lg:py-5 lg:px-6 rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent border border-[var(--card-border)] shadow-xl flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <TrophyIcon className="w-28 h-28 text-[var(--primary)]" />
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[9px] font-bold uppercase tracking-widest">
                  <SparklesIcon className="w-3 h-3" />
                  Elite AI Coaching
                </div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                  Fitness{' '}
                  <span className="text-[var(--primary)]">
                    Hub
                  </span>
                </h1>
                <p className="text-sm text-[var(--text-muted)] leading-snug font-medium">
                  {showWizard
                    ? 'Updating your plan — current stats stay in view.'
                    : fitnessProfile?.objective
                      ? `Optimizing for ${fitnessProfile.objective.toLowerCase()} with AI precision.`
                      : 'Build your expert coaching profile to begin.'}
                </p>
              </div>
              <div className="shrink-0 text-center">
                <div className="relative w-12 h-12 lg:w-14 lg:h-14">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeDasharray={`${completionPercentage} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] lg:text-xs font-black text-[var(--foreground)]">
                    {completionPercentage}%
                  </span>
                </div>
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Profile</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Weight', value: fitnessProfile?.weight ? `${fitnessProfile.weight} kg` : '--' },
                { label: 'Target', value: fitnessProfile?.targetWeightKg ? `${fitnessProfile.targetWeightKg} kg` : '--' },
                { label: 'BMI', value: bmi },
                { label: 'Height', value: fitnessProfile?.height ? `${fitnessProfile.height} cm` : '--' },
                { label: 'Activity', value: fitnessProfile?.activityLevel?.replace('_', ' ') || '--' },
                {
                  label: 'Age',
                  value:
                    fitnessProfile?.age 
                      ? `${fitnessProfile?.age ?? '--'}`
                      : '--',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-black/20 rounded-lg px-2 py-1.5 border border-[var(--card-border)]"
                >
                  <p className="text-[8px] lg:text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider truncate">
                    {item.label}
                  </p>
                  <p className="text-[11px] lg:text-xs font-bold text-[var(--foreground)] truncate capitalize">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Cal', value: fitnessProfile?.dailyCalorieTarget, unit: 'kcal' },
                { label: 'Protein', value: fitnessProfile?.dailyProteinTargetG, unit: 'g' },
                { label: 'Carbs', value: fitnessProfile?.dailyCarbsTargetG, unit: 'g' },
                { label: 'Fats', value: fitnessProfile?.dailyFatTargetG, unit: 'g' },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg px-2 py-1.5 border border-[var(--card-border)] bg-[var(--surface)] text-center"
                >
                  <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase">{m.label}</p>
                  <p className="text-xs lg:text-sm font-black text-[var(--foreground)] tabular-nums">
                    {m.value ?? '--'}
                    <span className="text-[8px] font-medium text-[var(--text-muted)] ml-0.5">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {fitnessProfile?.objective ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-[var(--card-border)]">
                {weightDelta && (
                  <span className="text-[10px] text-[var(--text-muted)]">
                    <span className="font-bold text-[var(--foreground)]">{weightDelta} kg</span> to goal
                  </span>
                )}
                {daysLeft !== null && (
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span className="font-bold text-blue-400">{daysLeft > 0 ? daysLeft : 0} days</span> left
                  </span>
                )}
                {fitnessProfile?.targetDate && (
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Target:{' '}
                    <span className="font-bold text-[var(--foreground)]">
                      {new Date(fitnessProfile.targetDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                )}
              </div>
            ) : !showWizard ? (
              <button
                onClick={() => setShowWizard(true)}
                className="w-full btn-primary py-2.5 text-sm font-bold rounded-xl shadow-[0_0_20px_#76b90033] hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                Start AI Consultation
              </button>
            ) : null}
          </div>
        </header>

        {/* Right column: Plan wizard OR Expert Strategy */}
        {showWizard && user ? (
          <aside className="animate-fade-in flex flex-col gap-2.5 min-w-0">
            <div className="flex items-center justify-between gap-3 bg-[var(--card-bg)]/50 px-3 py-2.5 rounded-xl border border-[var(--card-border)]">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black leading-tight truncate">
                  AI Plan <span className="text-[var(--primary)]">Consultation</span>
                </h2>
                <p className="text-[var(--text-muted)] text-[10px] truncate">
                  Update goals — Hub stays as your reference.
                </p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--card-border)] text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-strong)] flex items-center gap-1.5 transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
            </div>

            <FitnessSetupWizard
              userId={user.id}
              isInline={true}
              onCancel={() => setShowWizard(false)}
              onComplete={() => {
                setShowWizard(false);
                fetchFitnessProfile();
              }}
            />
          </aside>
        ) : (
          <aside className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card-bg)] to-transparent border border-[var(--primary)]/20 rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-lg group flex flex-col h-full">
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
              <SparklesIcon className="w-24 h-24 text-[var(--primary)]" />
            </div>

            <div className="relative z-10 flex flex-col h-full gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    <SparklesIcon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-black uppercase tracking-tight">
                      Expert Strategy
                    </h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-bold tracking-[0.15em]">
                      PRO TIPS • ACTIVE PLAN
                    </p>
                  </div>
                </div>
                {fitnessProfile?.objective && (
                  <button
                    onClick={() => setShowWizard(true)}
                    className="hidden lg:inline-flex items-center gap-1.5 btn-primary px-4 py-2 text-xs shadow-[0_0_18px_rgba(118,185,0,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    Modify Plan
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 bg-black/20 rounded-xl p-4 lg:p-5 border border-[var(--card-border)] flex flex-col justify-center min-h-[100px] lg:min-h-0">
                <p className="text-[var(--foreground)] text-sm lg:text-base leading-relaxed font-medium italic opacity-90 line-clamp-4 lg:line-clamp-6">
                  &ldquo;{fitnessProfile?.aiCoachAdvice || 'Log more data to unlock expert coaching strategies.'}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--card-border)]">
                  <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase">Focus</p>
                  <p className="text-xs font-bold text-[var(--foreground)] capitalize truncate">
                    {fitnessProfile?.objective?.toLowerCase() || 'Not set'}
                  </p>
                </div>
                <div className="rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--card-border)]">
                  <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase">Coach Status</p>
                  <p className="text-xs font-bold text-[var(--primary)]">
                    {fitnessProfile?.aiCoachAdvice ? 'Active' : 'Awaiting data'}
                  </p>
                </div>
              </div>

              {fitnessProfile?.objective && (
                <button
                  onClick={() => setShowWizard(true)}
                  className="lg:hidden w-full flex items-center justify-center gap-2 btn-primary py-3 text-sm shadow-[0_0_18px_rgba(118,185,0,0.35)] active:scale-[0.98] transition-transform"
                >
                  Modify Plan
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Rest of dashboard — hidden while consulting, returns with active data after */}
      {!showWizard && (
        <>
          {/* Stats row — compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
            <StatCard label="Daily Calories" value={fitnessProfile?.dailyCalorieTarget || '--'} unit="kcal" icon="🔥" color="var(--primary)" delay={0} />
            <StatCard label="Protein Goal" value={fitnessProfile?.dailyProteinTargetG || '--'} unit="g" icon="🥩" color="#2196f3" delay={0.05} />
            <StatCard label="Carbs Goal" value={fitnessProfile?.dailyCarbsTargetG || '--'} unit="g" icon="🍞" color="#ff9800" delay={0.1} />
            <StatCard label="Fats Goal" value={fitnessProfile?.dailyFatTargetG || '--'} unit="g" icon="🥑" color="#e91e63" delay={0.15} />
            <StatCard
              label="Target Weight"
              value={fitnessProfile?.targetWeightKg || '--'}
              unit="kg"
              icon="🎯"
              color="#9c27b0"
              delay={0.2}
            />
          </div>

          {/* Bottom grid — progression + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4 min-w-0">
            <div className="lg:col-span-3 min-w-0">
              <CollapsibleSection
                title="Progression Tracking"
                subtitle="Weight logs & trends"
                icon={ScaleIcon}
                defaultOpen={true}
                className="shadow-xl min-w-0"
              >
                {user && (
                  <WeightProgressWidget
                    userId={user.id}
                    targetWeight={fitnessProfile?.targetWeightKg || null}
                    initialWeight={fitnessProfile?.weight || null}
                    onLogSuccess={fetchFitnessProfile}
                    compact
                  />
                )}
              </CollapsibleSection>
            </div>

            <div className="space-y-3 lg:space-y-4">
              <CollapsibleSection
                title="Physical Data"
                subtitle="Body metrics"
                icon={UserCircleIcon}
                defaultOpen={false}
              >
                <ul className="space-y-2">
                  {[
                    { label: 'Current Weight', value: `${fitnessProfile?.weight || '--'} kg`, icon: ScaleIcon },
                    { label: 'Target Weight', value: `${fitnessProfile?.targetWeightKg || '--'} kg`, icon: TrophyIcon },
                    { label: 'Height', value: `${fitnessProfile?.height || '--'} cm`, icon: BoltIcon },
                    { label: 'BMI', value: bmi, icon: HeartIcon },
                    { label: 'Objective', value: fitnessProfile?.objective || 'Not Set', icon: SparklesIcon },
                    {
                      label: 'Activity',
                      value: fitnessProfile?.activityLevel?.replace('_', ' ') || 'Not Set',
                      icon: FireIcon,
                    },
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center py-2 border-b border-[var(--card-border)] last:border-0 group/stat"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] group-hover/stat:text-[var(--primary)] transition-colors">
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[var(--text-muted)] text-xs font-medium">{item.label}</span>
                      </div>
                      <span className="font-bold text-[var(--foreground)] text-xs capitalize group-hover/stat:text-[var(--primary)] transition-colors">
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>

              <CollapsibleSection
                title="Roadmap"
                subtitle="Goal timeline"
                icon={CalendarIcon}
                defaultOpen={false}
                className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">
                      Goal Completion
                    </p>
                    <p className="text-xl font-black text-[var(--foreground)] tabular-nums">
                      {fitnessProfile?.targetDate
                        ? new Date(fitnessProfile.targetDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Setting...'}
                    </p>
                  </div>
                  {daysLeft !== null && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <CalendarIcon className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Days remaining</p>
                        <p className="text-lg font-black text-blue-400 tabular-nums">
                          {daysLeft > 0 ? daysLeft : 0}
                        </p>
                      </div>
                    </div>
                  )}
                  {weightDelta && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                      <TrophyIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Weight to lose/gain</p>
                        <p className="text-lg font-black text-[var(--primary)] tabular-nums">{weightDelta} kg</p>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
