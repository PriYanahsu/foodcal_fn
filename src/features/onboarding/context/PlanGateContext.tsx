'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { PlanRequiredDialog } from '../components/PlanRequired';
import { useOnboarding } from '../hooks/useOnboarding';

interface PlanGate {
  /** True only once the server has confirmed a plan: the one test for "may log". */
  canLog: boolean;
  /** Opens the app-wide "set up your plan first" warning. */
  showPlanWarning: () => void;
}

const PlanGateContext = createContext<PlanGate>({ canLog: false, showPlanWarning: () => {} });

/** One "plan first" warning for the whole app, so any button can raise it. */
export function PlanGateProvider({ children }: { children: ReactNode }) {
  const { planKnown, hasPlan } = useOnboarding();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const showPlanWarning = useCallback(() => setOpen(true), []);

  return (
    <PlanGateContext.Provider value={{ canLog: planKnown && hasPlan, showPlanWarning }}>
      {children}
      <PlanRequiredDialog open={open} onClose={close} />
    </PlanGateContext.Provider>
  );
}

export const usePlanGate = () => useContext(PlanGateContext);
