'use client';

import React, { useCallback, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { buttonClass } from '@/components/ui/fc';
import { ROUTES } from '@/constants/routes';
import { useFoodScan } from '../hooks/useFoodScan';
import { useScanDraft } from '../hooks/useScanDraft';
import { AiScanOverlay } from './AiScanOverlay';
import { CameraInput } from './CameraInput';
import { CaptureStage } from './CaptureStage';
import { MobileReviewSheet } from './MobileReviewSheet';
import { PhotoStage } from './PhotoStage';
import { ReviewPanel } from './ReviewPanel';
import { PanelLabel, PanelSection, ScanPanel } from './ScanPanel';
import { ScanStepper } from './ScanStepper';

type Stage = 'photo' | 'context' | 'analyzing' | 'review';

const TITLES: Record<Stage, string> = {
  photo: 'Snap your meal',
  context: 'Anything we should know?',
  analyzing: 'Reading your meal…',
  review: 'Check what we found',
};

/** `photo` and `context` are both step 1 — the photo isn't committed until the scan runs. */
const STEP_OF: Record<Stage, number> = { photo: 0, context: 0, analyzing: 1, review: 1 };

export const FoodScanPage: React.FC = () => {
  const { scanImage, saveFoodLog, isLoading, isSaving, nutritionData, error, reset } =
    useFoodScan();
  const draft = useScanDraft(nutritionData);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    detail?: string;
    actionLabel?: string;
    actionHref?: string;
  } | null>(null);

  const clearToast = useCallback(() => setToast(null), []);
  const closeNotes = useCallback(() => setNotesOpen(false), []);
  const openNotes = useCallback(() => setNotesOpen(true), []);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    reset();
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setPreview(null);
    setSelectedFile(null);
    setPrompt('');
    reset();
  };

  const handleScan = () => {
    if (!selectedFile) return;
    draft.restart();
    scanImage(selectedFile, prompt);
  };

  const handleLogMeal = async () => {
    if (!selectedFile || !draft.meal) return;
    const { foodName, mealType } = draft.meal;
    const success = await saveFoodLog(selectedFile, draft.meal);
    if (!success) return;
    setToast({
      message: `Logged to ${mealType}`,
      detail: `${foodName || 'Your meal'} is in your history. Tap to see it there.`,
      actionLabel: 'View in History',
      actionHref: ROUTES.HISTORY,
    });
    handleReset();
  };

  const stage: Stage = !preview
    ? 'photo'
    : isLoading
      ? 'analyzing'
      : nutritionData
        ? 'review'
        : 'context';

  return (
    <MotionConfig reducedMotion="user">
      <CameraInput onImageSelect={handleImageSelect} isLoading={isLoading}>
        {(openCamera, openUpload) => (
          // One screen everywhere. Phones: the viewport minus the top bar (64px), the tab bar
          // (68px + inset) and the 36px the tab bar's camera button sticks up above it —
          // without that last bit the bottom row ends up underneath it. Desktop has none of
          // those bars, so it gets the whole viewport; the photo absorbs the slack, which is
          // what keeps a big screen from ending in a void.
          <div className="mx-auto flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] w-full max-w-[1240px] flex-col gap-3 bg-canvas px-4 py-3 font-ui text-fg md:h-dvh md:min-h-[620px] md:max-w-[1440px] md:gap-5 md:px-8 md:py-8">
            <header className="flex shrink-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 hidden text-[13px] font-semibold text-muted md:block">
                  Scan a meal
                </p>
                <h1 className="truncate font-display text-[22px] font-bold leading-tight tracking-[-0.02em] md:text-[26px]">
                  {TITLES[stage]}
                </h1>
              </div>
              {/* Kept left of the floating notification bell on desktop. */}
              <div className="flex shrink-0 items-center md:mr-14">
                <ScanStepper current={STEP_OF[stage]} />
              </div>
            </header>

            {stage === 'photo' ? (
              <CaptureStage onOpenCamera={openCamera} onOpenUpload={openUpload} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                // At `review` the phone gets the full-screen sheet below instead.
                className={`flex min-h-0 flex-1 flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] md:items-stretch md:gap-6 ${
                  stage === 'review' ? 'max-md:hidden' : ''
                }`}
              >
                <div className="flex min-h-0 flex-1 flex-col gap-3">
                  <PhotoStage
                    src={preview!}
                    scanning={isLoading}
                    className="min-h-0 flex-1 rounded-3xl border border-line"
                  >
                    {isLoading && <AiScanOverlay prompt={prompt} />}

                    {!isLoading && (
                      <button
                        type="button"
                        onClick={handleReset}
                        aria-label="Discard this photo"
                        className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1/85 text-fg backdrop-blur transition-transform active:scale-90"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}

                    {stage === 'review' && draft.meal && (
                      // The notes sit in the panel at this size, so no info button here.
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-1/85 px-3 py-2 text-xs font-bold text-fg backdrop-blur">
                        <SparklesIcon className="h-4 w-4 text-brand-ink" />
                        AI estimate
                      </span>
                    )}
                  </PhotoStage>

                  {/* Phones reach these through the photo's × and the panel's Discard. */}
                  {!isLoading && (
                    <div className="hidden shrink-0 gap-3 md:flex">
                      <button
                        type="button"
                        onClick={openCamera}
                        className={buttonClass('secondary', 'sm')}
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        Retake
                      </button>
                      <button
                        type="button"
                        onClick={openUpload}
                        className={buttonClass('secondary', 'sm')}
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
                        Upload a different photo
                      </button>
                    </div>
                  )}
                </div>

                {stage === 'review' && draft.meal ? (
                  <ReviewPanel
                    meal={draft.meal}
                    mealType={draft.mealType}
                    onMealType={draft.setMealType}
                    isEditing={draft.isEditing}
                    onToggleEdit={draft.toggleEdit}
                    onField={draft.setField}
                    isEdited={draft.isEdited}
                    onLog={handleLogMeal}
                    onDiscard={handleReset}
                    isSaving={isSaving}
                    error={error}
                  />
                ) : (
                  <ScanPanel>
                    <PanelSection>
                      <label htmlFor="scan-context" className="block">
                        <PanelLabel hint="Optional">Anything else?</PanelLabel>
                      </label>
                      <textarea
                        id="scan-context"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                        rows={3}
                        placeholder="e.g. cooked in 1 tbsp butter"
                        className="scrollbar-theme mt-2 w-full resize-none rounded-xl border border-line bg-surface-2 p-3 text-sm text-fg outline-none transition-colors placeholder:text-muted focus:border-brand/50 disabled:opacity-60"
                      />
                      <p className="mt-2 hidden text-xs text-muted md:block">
                        Naming portions or hidden ingredients gets the estimate a lot closer.
                      </p>
                    </PanelSection>

                    {error && (
                      <p className="shrink-0 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] font-semibold text-danger md:mt-4">
                        {error}
                      </p>
                    )}

                    <div className="grid shrink-0 grid-cols-[auto_1fr] gap-2 md:mt-auto md:gap-3 md:pt-6">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading}
                        className={buttonClass('secondary', 'md')}
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={handleScan}
                        disabled={isLoading}
                        className={buttonClass('primary', 'md')}
                      >
                        <SparklesIcon className="h-5 w-5" />
                        {isLoading ? 'Scanning…' : 'Run AI scan'}
                      </button>
                    </div>
                  </ScanPanel>
                )}
              </motion.div>
            )}
          </div>
        )}
      </CameraInput>

      {stage === 'review' && draft.meal && preview && (
        <MobileReviewSheet
          preview={preview}
          meal={draft.meal}
          mealType={draft.mealType}
          onMealType={draft.setMealType}
          isEditing={draft.isEditing}
          onToggleEdit={draft.toggleEdit}
          onField={draft.setField}
          isEdited={draft.isEdited}
          onLog={handleLogMeal}
          onDiscard={handleReset}
          onOpenNotes={openNotes}
          isSaving={isSaving}
          error={error}
        />
      )}

      <BottomSheet open={notesOpen} onClose={closeNotes} label="How we got this estimate">
        <div className="pb-4">
          <p className="font-display text-lg font-bold tracking-[-0.02em] text-fg">
            {nutritionData?.foodName || 'Your meal'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">{nutritionData?.analysisNotes}</p>
        </div>
      </BottomSheet>

      <SuccessToast
        message={toast?.message ?? null}
        detail={toast?.detail}
        actionLabel={toast?.actionLabel}
        actionHref={toast?.actionHref}
        onClose={clearToast}
      />
    </MotionConfig>
  );
};
