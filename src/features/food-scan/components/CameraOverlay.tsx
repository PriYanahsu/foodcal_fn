'use client';

import { useEffect } from 'react';
import { ArrowPathRoundedSquareIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CameraOverlayProps } from '../types';

const CHROME_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur transition-transform active:scale-90';

export const CameraOverlay = ({
  onCapture,
  onClose,
  onSwitchCamera,
  onPickFromGallery,
  videoRef,
  canvasRef,
  error,
}: CameraOverlayProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo"
      className="fixed inset-0 z-[100] flex animate-fade-in flex-col bg-black font-ui text-white"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} aria-label="Close camera" className={CHROME_BUTTON}>
          <XMarkIcon className="h-5 w-5" />
        </button>
        <p className="font-display text-base font-bold tracking-[-0.01em]">Take a photo</p>
        <button
          type="button"
          onClick={onSwitchCamera}
          aria-label="Switch camera"
          className={CHROME_BUTTON}
        >
          <ArrowPathRoundedSquareIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Framing guide — brackets only, so nothing covers the food. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-6 md:inset-[12%]">
          <span className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-[3px] border-t-[3px] border-brand" />
          <span className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-[3px] border-t-[3px] border-brand" />
          <span className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-[3px] border-l-[3px] border-brand" />
          <span className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-[3px] border-r-[3px] border-brand" />
        </div>

        <p className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/65 px-3.5 py-2 text-[13px] font-semibold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Centre your plate
          </span>
        </p>

        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 p-8 backdrop-blur">
            <div className="max-w-xs text-center">
              <p className="text-sm font-semibold text-danger">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 h-11 rounded-xl bg-brand px-5 text-sm font-bold text-on-brand"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between px-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
        <button
          type="button"
          onClick={onPickFromGallery}
          aria-label="Choose a photo instead"
          className={`${CHROME_BUTTON} ${onPickFromGallery ? '' : 'invisible'}`}
        >
          <PhotoIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onCapture}
          aria-label="Take photo"
          className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-[3px] border-white transition-transform active:scale-90"
        >
          <span className="h-[58px] w-[58px] rounded-full bg-white" />
        </button>

        <button
          type="button"
          onClick={onSwitchCamera}
          aria-label="Switch camera"
          className={`${CHROME_BUTTON} rounded-full`}
        >
          <ArrowPathRoundedSquareIcon className="h-5 w-5" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
