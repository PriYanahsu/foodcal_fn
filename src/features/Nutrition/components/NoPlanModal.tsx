'use client';

import { LockClosedIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import type { NoPlanModalProps } from '../type';
import { LOCKED_MACRO_PREVIEW } from '../utils/Constants';

export default function NoPlanModal({ open, onClose, onStart }: NoPlanModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[var(--card-bg)] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                <LockClosedIcon className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-black text-white">Unlock Your Nutrition Targets</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your calorie, protein, carbs, and fat targets are locked until you complete a quick{' '}
                <span className="text-white font-semibold">AI plan consultation</span>. It takes
                under 2 minutes.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 opacity-40 select-none pointer-events-none">
              {LOCKED_MACRO_PREVIEW.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center"
                >
                  <div className="text-base mb-1">{m.icon}</div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">{m.label}</p>
                  <p className="text-sm font-black text-white/30">--</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onStart}
                className="w-full btn-primary py-3 text-sm font-bold rounded-xl shadow-[0_0_20px_#00ff8833] hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                Start AI Plan Consultation
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-white transition-colors font-medium"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
