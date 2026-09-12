'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { DEFAULT_CHIPS, ANALYSIS_STEPS, CHIP_POSITIONS } from '../utils/constants';

function chipsFromPrompt(prompt: string): string[] {
  const parts = prompt
    .split(/[,+/&]| and | with /i)
    .map((p) => p.trim())
    .filter((p) => p.length > 2 && p.length < 28)
    .slice(0, 4);

  if (parts.length === 0) return DEFAULT_CHIPS;
  return parts.map((p) => p.replace(/^./, (c) => c.toUpperCase()));
}

interface AiScanOverlayProps {
  prompt?: string;
}

export const AiScanOverlay: React.FC<AiScanOverlayProps> = ({ prompt = '' }) => {
  const chips = useMemo(() => chipsFromPrompt(prompt), [prompt]);
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleChips, setVisibleChips] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % ANALYSIS_STEPS.length);
    }, 1400);

    const chipTimer = window.setInterval(() => {
      setVisibleChips((n) => Math.min(n + 1, chips.length));
    }, 900);

    const progressTimer = window.setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 7 + 2, 94));
    }, 500);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(chipTimer);
      window.clearInterval(progressTimer);
    };
  }, [chips.length]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {/* Soft veil — works on both themes without crushing light mode */}
      <div className="absolute inset-0 bg-[var(--overlay)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/35 via-transparent to-[var(--background)]/55" />

      {/* Targeting reticle */}
      <div className="absolute inset-8 rounded-[1.75rem] border border-[var(--primary)]/40">
        <div className="absolute -top-px -left-px w-10 h-10 border-t-2 border-l-2 border-[var(--primary)] rounded-tl-2xl" />
        <div className="absolute -top-px -right-px w-10 h-10 border-t-2 border-r-2 border-[var(--primary)] rounded-tr-2xl" />
        <div className="absolute -bottom-px -left-px w-10 h-10 border-b-2 border-l-2 border-[var(--primary)] rounded-bl-2xl" />
        <div className="absolute -bottom-px -right-px w-10 h-10 border-b-2 border-r-2 border-[var(--primary)] rounded-br-2xl" />

        <div
          className="absolute inset-3 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(118,185,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(118,185,0,0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="scan-beam z-20" />

      {/* Live badge */}
      <div className="absolute top-5 left-5 z-30">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--primary)]/35 shadow-md backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">
            Vision Live
          </span>
        </div>
      </div>

      {chips.slice(0, visibleChips).map((label, i) => {
        const pos = CHIP_POSITIONS[i % CHIP_POSITIONS.length];
        return (
          <motion.div
            key={`${label}-${i}`}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="absolute z-20"
            style={pos}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--primary)]/40 shadow-md backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              <span className="text-[10px] font-bold tracking-wide text-[var(--foreground)]">{label}</span>
              <span className="text-[9px] font-mono text-[var(--primary)]">{88 - i * 7}%</span>
            </div>
          </motion.div>
        );
      })}

      <div className="absolute inset-x-0 bottom-0 p-4 z-30">
        <div className="mx-auto max-w-sm rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl backdrop-blur-xl px-4 py-3.5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-[var(--primary)] animate-pulse" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-0.5">
                AI Prediction
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold text-[var(--foreground)] truncate"
                >
                  {prompt.trim() && stepIndex === 1
                    ? 'Reading your notes…'
                    : ANALYSIS_STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--primary)]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-1 rounded-full bg-[var(--surface-strong)] overflow-hidden border border-[var(--card-border)]">
            <motion.div
              className="h-full rounded-full bg-[var(--primary)] shadow-[0_0_12px_var(--primary)]"
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
