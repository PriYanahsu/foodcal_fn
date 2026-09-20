import React from 'react';

interface PhotoStageProps {
  src: string;
  /** Nudges the photo in while the AI reads it, under the scan overlay. */
  scanning?: boolean;
  /** Carries the frame (rounding, border) — full-bleed callers simply omit it. */
  className?: string;
  /** Takes the photo back a little so chips and the card sitting on it stay legible. */
  dim?: boolean;
  children?: React.ReactNode;
}

/** The meal photo. Overlays (scan animation, chips, controls) come in as children. */
export const PhotoStage: React.FC<PhotoStageProps> = ({
  src,
  scanning = false,
  className = '',
  dim = false,
  children,
}) => (
  <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element -- local data URL, not a remote asset */}
    <img
      src={src}
      alt="The meal you photographed"
      className={`h-full w-full object-cover transition-transform duration-700 ${
        scanning ? 'scale-[1.03]' : ''
      }`}
    />
    {dim && (
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/35"
      />
    )}
    {children}
  </div>
);
