'use client';

// TEMPORARY layout harness — delete after checking the scan redesign at each size.
import React, { useState } from 'react';
import { PhotoStage } from '@/features/food-scan/components/PhotoStage';
import { ReviewPanel } from '@/features/food-scan/components/ReviewPanel';
import { ScanStepper } from '@/features/food-scan/components/ScanStepper';
import { CaptureStage } from '@/features/food-scan/components/CaptureStage';
import type { MealType, NutritionData } from '@/features/food-scan/types';
import { buttonClass } from '@/components/ui/fc';
import { ArrowPathIcon, ArrowUpTrayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#2b3a1c"/><circle cx="400" cy="400" r="240" fill="#6d5a2a"/><circle cx="330" cy="360" r="70" fill="#c9a227"/><circle cx="470" cy="430" r="60" fill="#a33"/><text x="400" y="740" font-size="40" fill="#fff" text-anchor="middle">meal photo</text></svg>`
  );

const BASE: NutritionData = {
  foodName: 'Paneer tikka wrap',
  quantity: '1 wrap',
  calories: 445,
  proteinG: 23,
  fatG: 20,
  carbohydrateG: 43,
  aiConfidence: 0.92,
  analysisNotes:
    'Estimated from a whole-wheat roti, about 100 g of paneer tikka and a spoon of mint chutney.',
  mealType: 'lunch',
};

export default function ScanPreview() {
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mode, setMode] = useState<'review' | 'capture'>('review');

  const meal: NutritionData = {
    ...BASE,
    mealType,
    calories: BASE.calories * servings,
    proteinG: BASE.proteinG * servings,
    fatG: BASE.fatG * servings,
    carbohydrateG: BASE.carbohydrateG * servings,
    quantity: servings === 1 ? BASE.quantity : `${servings} × ${BASE.quantity}`,
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] w-full max-w-[1240px] flex-col gap-3 bg-canvas px-4 py-3 font-ui text-fg md:h-dvh md:min-h-[620px] md:max-w-[1440px] md:gap-5 md:px-8 md:py-8">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 hidden text-[13px] font-semibold text-muted md:block">Scan a meal</p>
          <h1 className="truncate font-display text-[22px] font-bold leading-tight tracking-[-0.02em] md:text-[26px]">
            <button onClick={() => setMode(mode === 'review' ? 'capture' : 'review')}>
              Check what we found
            </button>
          </h1>
        </div>
        <div className="flex shrink-0 items-center md:mr-14">
          <ScanStepper current={mode === 'review' ? 1 : 0} />
        </div>
      </header>

      {mode === 'capture' ? (
        <CaptureStage onOpenCamera={() => {}} onOpenUpload={() => {}} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] md:items-stretch md:gap-6">
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <PhotoStage
              src={IMG}
              className="min-h-0 flex-1"
            >
              <span className="absolute inset-x-3 bottom-3 flex items-center gap-2">
                <span className="min-w-0 truncate rounded-full border border-line bg-surface-1/90 px-3 py-1.5 text-xs font-bold text-fg backdrop-blur">
                  {meal.foodName}
                </span>
                <button className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-1/90 text-fg backdrop-blur md:hidden">
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
            baseQuantity={BASE.quantity}
            servings={servings}
            onIncrement={() => setServings((s) => Math.min(10, s + 0.5))}
            onDecrement={() => setServings((s) => Math.max(0.5, s - 0.5))}
            mealType={mealType}
            onMealType={setMealType}
            onLog={() => {}}
            onDiscard={() => {}}
            isSaving={false}
          />
        </div>
      )}
    </div>
  );
}
