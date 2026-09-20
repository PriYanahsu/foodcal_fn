'use client';

// TEMPORARY layout harness — deleted once the scan redesign is checked at each size.
import React, { useState } from 'react';
import { PhotoStage } from '@/features/food-scan/components/PhotoStage';
import { ReviewPanel } from '@/features/food-scan/components/ReviewPanel';
import { MobileReviewSheet } from '@/features/food-scan/components/MobileReviewSheet';
import { ScanStepper } from '@/features/food-scan/components/ScanStepper';
import type { EditableField, MealType, NutritionData } from '@/features/food-scan/types';
import { buttonClass } from '@/components/ui/fc';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  InformationCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="900" height="700" fill="#3a2c18"/><circle cx="450" cy="330" r="230" fill="#8a6b2f"/><circle cx="370" cy="290" r="72" fill="#d8b23f"/><circle cx="530" cy="380" r="62" fill="#a8412f"/></svg>`
  );

const BASE: NutritionData = {
  foodName: 'Chicken biryani with raita',
  quantity: '1 plate (~350 g)',
  calories: 620,
  proteinG: 34,
  fatG: 20,
  carbohydrateG: 72,
  aiConfidence: 0.86,
  analysisNotes: 'Estimated from a plate of chicken biryani with a small bowl of raita.',
  mealType: 'dinner',
};

export default function UiPreview() {
  const [mealType, setMealType] = useState<MealType>('dinner');
  const [edits, setEdits] = useState<Partial<Record<EditableField, number>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const meal: NutritionData = { ...BASE, ...edits, mealType };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] w-full max-w-[1240px] flex-col gap-3 bg-canvas px-4 py-3 font-ui text-fg md:h-dvh md:min-h-[620px] md:max-w-[1440px] md:gap-5 md:px-8 md:py-8">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 hidden text-[13px] font-semibold text-muted md:block">Scan a meal</p>
          <h1 className="truncate font-display text-[22px] font-bold leading-tight tracking-[-0.02em] md:text-[26px]">
            Check what we found
          </h1>
        </div>
        <div className="flex shrink-0 items-center md:mr-14">
          <ScanStepper current={1} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 max-md:hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] md:items-stretch md:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <PhotoStage src={IMG} className="min-h-0 flex-1 rounded-3xl border border-line">
            <button
              aria-label="Discard this photo"
              className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1/85 text-fg backdrop-blur"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <span className="absolute right-3 top-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-1/85 px-3 py-2 text-xs font-bold text-fg backdrop-blur">
                <SparklesIcon className="h-4 w-4 text-brand-ink" />
                AI estimate
              </span>
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-1/85 text-fg backdrop-blur md:hidden">
                <InformationCircleIcon className="h-5 w-5" />
              </button>
            </span>
          </PhotoStage>
          <div className="hidden shrink-0 gap-3 md:flex">
            <button className={buttonClass('secondary', 'sm')}>
              <ArrowPathIcon className="h-4 w-4" />
              Retake
            </button>
            <button className={buttonClass('secondary', 'sm')}>
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload a different photo
            </button>
          </div>
        </div>

        <ReviewPanel
          meal={meal}
          mealType={mealType}
          onMealType={setMealType}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing((v) => !v)}
          onField={(f, v) => setEdits((e) => ({ ...e, [f]: v }))}
          isEdited={Object.keys(edits).length > 0}
          onLog={() => {}}
          onDiscard={() => {}}
          isSaving={false}
        />
      </div>

      <MobileReviewSheet
        preview={IMG}
        meal={meal}
        mealType={mealType}
        onMealType={setMealType}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((v) => !v)}
        onField={(f, v) => setEdits((e) => ({ ...e, [f]: v }))}
        isEdited={Object.keys(edits).length > 0}
        onLog={() => {}}
        onDiscard={() => {}}
        onOpenNotes={() => {}}
        isSaving={false}
      />
    </div>
  );
}
