'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { PlanRequiredDialog } from '../components/PlanRequired';
import { useOnboarding } from '../hooks/useOnboarding';

interface PlanGate {
  /** True only once the server has confirmed a plan: the one test for "may log". */
  canLog: boolean;
  /** Opens the app-wide "set up your plan first" warning. */
  showPlanWarning: () => void;
  /**
   * For the click handler of anything that logs: returns true when it may go ahead,
   * otherwise cancels the click (e.g. a link's navigation) and shows the warning.
   */
  requirePlan: (e?: SyntheticEvent) => boolean;
}

const PlanGateContext = createContext<PlanGate>({
  canLog: false,
  showPlanWarning: () => {},
  requirePlan: () => false,
});

/** One "plan first" warning for the whole app, so any button can raise it. */
export function PlanGateProvider({ children }: { children: ReactNode }) {
  const { planKnown, hasPlan } = useOnboarding();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const showPlanWarning = useCallback(() => setOpen(true), []);
  const canLog = planKnown && hasPlan;
  const requirePlan = (e?: SyntheticEvent) => {
    if (canLog) return true;
    e?.preventDefault();
    setOpen(true);
    return false;
  };

  return (
    <PlanGateContext.Provider value={{ canLog, showPlanWarning, requirePlan }}>
      {children}
      <PlanRequiredDialog open={open} onClose={close} />
    </PlanGateContext.Provider>
  );
}

export const usePlanGate = () => useContext(PlanGateContext);
