'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStepTrackerContext } from '../context/StepTrackerContext';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
// We use custom SVGs defined below instead of external icon libraries

export const StepTracker: React.FC = () => {
  const { steps, distance, calories, isTracking, requestPermission, stopTracking } =
    useStepTrackerContext();
  const { user } = useAuth();

  // State for editable step goal
  const [stepGoal, setStepGoal] = useState(10000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(10000);
  const [isSaving, setIsSaving] = useState(false); // Valid Loading State

  // Load step goal from database on mount
  useEffect(() => {
    const loadStepGoal = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_preferences')
        .select('step_goal')
        .eq('user_id', user.id)
        .single();

      if (data && data.step_goal) {
        setStepGoal(data.step_goal);
        setTempGoal(data.step_goal);
      }
    };

    loadStepGoal();
  }, [user]);

  // Save step goal to database
  const saveStepGoal = async () => {
    if (!user || tempGoal < 100) return;

    setIsSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from('user_preferences').upsert(
        {
          user_id: user.id,
          step_goal: tempGoal,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

      if (!error) {
        setStepGoal(tempGoal);
        setIsEditingGoal(false);
      } else {
        console.error('Failed to save goal:', error);
        alert('Failed to save goal. Please check your connection.');
      }
    } catch (e) {
      console.error('Unexpected error saving goal', e);
    } finally {
      setIsSaving(false);
    }
  };

  const progress = Math.min((steps / stepGoal) * 100, 100);

  return (
    <div className="glass-card p-4 sm:p-6 relative overflow-hidden group">
      {/* Background Animation */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-all duration-700" />

      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)] shrink-0">
              <FootprintsIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${isTracking ? 'animate-pulse' : ''}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-white text-base sm:text-lg tracking-tight">Daily Steps</h3>
              <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">
                Activity Tracker
              </p>
            </div>
          </div>

          {!isTracking ? (
            <button
              onClick={requestPermission}
              className="btn-primary py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
            >
              <PlayIcon className="w-3 h-3 fill-current" />
              Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all"
            >
              <StopIcon className="w-3 h-3 fill-current" />
              Stop Tracking
            </button>
          )}
        </div>

        {!isTracking && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <p className="text-xs text-orange-300 leading-relaxed">
              📱 <strong>Mobile Device Required:</strong> Step tracking uses motion sensors only
              available on smartphones. Open this page on your phone to track steps.
            </p>
          </div>
        )}

        <div className="relative pt-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-2xl sm:text-4xl font-black text-white tabular-nums tracking-tighter">
              {steps.toLocaleString()}
            </span>
            {isEditingGoal ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="relative group">
                  <input
                    type="number"
                    autoFocus
                    disabled={isSaving}
                    value={tempGoal}
                    onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveStepGoal();
                      if (e.key === 'Escape') {
                        setIsEditingGoal(false);
                        setTempGoal(stepGoal);
                      }
                    }}
                    className="w-28 px-3 py-2 text-base font-bold bg-white/10 border border-[var(--primary)]/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner disabled:opacity-50"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] absolute -top-4 right-0 font-bold uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    Set Goal
                  </span>
                </div>

                <button
                  onClick={saveStepGoal}
                  disabled={isSaving}
                  className="w-10 h-10 rounded-xl bg-[var(--primary)] text-black flex items-center justify-center active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save Goal"
                >
                  {isSaving ? (
                    <svg
                      className="animate-spin h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsEditingGoal(false);
                    setTempGoal(stepGoal);
                  }}
                  disabled={isSaving}
                  className="w-10 h-10 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                  title="Cancel"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingGoal(true)}
                className="group flex flex-col items-end p-2 -mr-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider group-hover:text-[var(--primary)] transition-colors mb-0.5">
                  Goal Target
                </span>
                <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                  <span className="text-xl font-bold tabular-nums">
                    {stepGoal.toLocaleString()}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-black transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Progress Bar Container */}
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="block text-[var(--text-muted)] text-[10px] uppercase font-black mb-1">
              Distance
            </span>
            <span className="text-white font-bold">
              {distance.toFixed(2)} <small className="text-gray-500 font-normal">km</small>
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="block text-[var(--text-muted)] text-[10px] uppercase font-black mb-1">
              Burned
            </span>
            <span className="text-white font-bold">
              {calories.toFixed(0)} <small className="text-gray-500 font-normal">kcal</small>
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2">
          <div className="h-1 w-1 bg-[var(--primary)] rounded-full animate-ping" />
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
            {isTracking ? 'Smart tracking active' : 'Tracking paused'}
          </span>
        </div>
      </div>

      {/* Locked Overlay if not tracking */}
      {!isTracking && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 hidden group-hover:flex items-center justify-center transition-all duration-500">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full shadow-2xl">
            Click 'Start' to Activate
          </span>
        </div>
      )}
    </div>
  );
};

// Simple FootprintsIcon component since we don't have Lucide
const FootprintsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.5 1.89-4 4.5-4 2.1 0 3.3.7 4.5 2.5 1.2 1.8 1.5 2 2.5 2a3 3 0 0 1 2.5 1.5" />
    <path d="M14.5 18a4.5 4.5 0 0 1-5 0" />
    <path d="M12 21a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const StopIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);
