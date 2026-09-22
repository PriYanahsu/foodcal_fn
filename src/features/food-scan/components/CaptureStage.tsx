import React from 'react';
import {
  CameraIcon,
  PhotoIcon,
  PencilSquareIcon,
  SunIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';

const TIPS = [
  {
    icon: SunIcon,
    tone: 'bg-carbs/15 text-carbs',
    title: 'Good light helps',
    body: 'Daylight shows colours and portions best.',
  },
  {
    icon: EyeIcon,
    tone: 'bg-fat/15 text-fat',
    title: 'Shoot from above',
    body: 'Fit the whole plate, with nothing cut off.',
  },
  {
    icon: PencilSquareIcon,
    tone: 'bg-brand/15 text-brand-ink',
    title: 'Add details for accuracy',
    body: 'Portions or hidden oil and sauces make a big difference.',
  },
];

/** Thin green brackets around the target, like a viewfinder. */
const Reticle: React.FC = () => (
  <span aria-hidden="true">
    <span className="absolute left-6 top-6 h-10 w-10 rounded-tl-2xl border-l-2 border-t-2 border-brand" />
    <span className="absolute right-6 top-6 h-10 w-10 rounded-tr-2xl border-r-2 border-t-2 border-brand" />
    <span className="absolute bottom-6 left-6 h-10 w-10 rounded-bl-2xl border-b-2 border-l-2 border-brand" />
    <span className="absolute bottom-6 right-6 h-10 w-10 rounded-br-2xl border-b-2 border-r-2 border-brand" />
  </span>
);

interface CaptureStageProps {
  onOpenCamera: () => void;
  onOpenUpload: () => void;
}

/**
 * Step 1: the viewfinder, the two ways in, and what makes an estimate good.
 * The target shrinks to whatever height the phone has left so nothing below it
 * ever falls off screen.
 */
export const CaptureStage: React.FC<CaptureStageProps> = ({ onOpenCamera, onOpenUpload }) => (
  // Phones stack; from `md` up it is one row, 60% viewfinder / 40% actions and tips.
  <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-3 md:grid md:max-w-none md:grid-cols-[3fr_2fr] md:items-stretch md:gap-6 lg:gap-12">
    <button
      type="button"
      onClick={onOpenCamera}
      className="group relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border border-line bg-surface-1 p-4 text-center transition-transform active:scale-[0.99]"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(var(--fc-brand-rgb)/0.12),transparent_62%)]" />
      <Reticle />

      <span className="relative flex flex-col items-center gap-3 short:gap-2">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-on-brand transition-transform group-hover:scale-105 short:h-14 short:w-14">
          <CameraIcon className="h-8 w-8" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-display text-xl font-bold tracking-[-0.02em] text-fg">
            Open camera
          </span>
          <span className="text-[13px] text-muted">Centre your plate in the frame</span>
        </span>
      </span>
    </button>

    {/* From md up this is a panel of its own, so the two halves read as a pair
        instead of a small cluster floating beside a tall box. */}
    <div className="flex shrink-0 flex-col gap-4 md:h-full md:min-h-0 md:justify-center md:gap-6 md:rounded-3xl md:border md:border-line md:bg-surface-1 md:p-6">
      <div className="grid shrink-0 grid-cols-2 gap-2.5 md:gap-3">
        <button type="button" onClick={onOpenUpload} className={buttonClass('secondary', 'md')}>
          <PhotoIcon className="h-5 w-5" />
          Choose photo
        </button>
        <button type="button" onClick={onOpenCamera} className={buttonClass('primary', 'md')}>
          <CameraIcon className="h-5 w-5" />
          Open camera
        </button>
      </div>

      <div className="min-h-0 shrink-0 short:hidden md:border-t md:border-line md:pt-6">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Tips for a better estimate
        </p>
        <ul className="flex flex-col gap-2.5">
          {TIPS.map(({ icon: Icon, tone, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-fg">{title}</span>
                <span className="block text-xs leading-snug text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
