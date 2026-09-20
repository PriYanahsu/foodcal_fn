'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { InformationCircleIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { EditableField, MealType, NutritionData } from '../types';
import { PhotoStage } from './PhotoStage';
import { ReviewPanel } from './ReviewPanel';

const CHIP =
  'flex h-10 items-center justify-center rounded-xl border border-line bg-surface-1/85 text-fg backdrop-blur transition-transform active:scale-90';

interface MobileReviewSheetProps {
  preview: string;
  meal: NutritionData;
  mealType: MealType;
  onMealType: (meal: MealType) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  onField: (field: EditableField, value: number) => void;
  isEdited: boolean;
  onLog: () => void;
  onDiscard: () => void;
  onOpenNotes: () => void;
  isSaving: boolean;
  error?: string | null;
}

/**
 * The phone's review step: a full-screen takeover so the photo runs to the top
 * edge with no page title, stepper or tab bar competing with it. It is portalled
 * to the body because the page sits inside animated (transformed) ancestors,
 * which would otherwise anchor `fixed` to them. Logging or discarding closes it.
 */
export const MobileReviewSheet: React.FC<MobileReviewSheetProps> = ({
  preview,
  onOpenNotes,
  ...panel
}) => {
  // Nothing behind this should scroll while it is up.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Check what we found"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[120] flex flex-col bg-canvas font-ui text-fg md:hidden"
    >
      <PhotoStage src={preview} className="min-h-0 flex-1">
        <button
          type="button"
          onClick={panel.onDiscard}
          aria-label="Discard this scan"
          className={`${CHIP} absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] w-10`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <span className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex items-center gap-2">
          <span className={`${CHIP} gap-1.5 rounded-full px-3 text-xs font-bold`}>
            <SparklesIcon className="h-4 w-4 text-brand-ink" />
            AI estimate
          </span>
          {panel.meal.analysisNotes && (
            <button
              type="button"
              onClick={onOpenNotes}
              aria-label="How we got this estimate"
              className={`${CHIP} w-10 shrink-0`}
            >
              <InformationCircleIcon className="h-5 w-5" />
            </button>
          )}
        </span>
      </PhotoStage>

      <ReviewPanel variant="sheet" {...panel} />
    </motion.div>,
    document.body
  );
};
