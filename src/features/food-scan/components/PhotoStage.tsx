import React from 'react';

interface PhotoStageProps {
  src: string;
  /** Nudges the photo in while the AI reads it, under the scan overlay. */
  scanning?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** The framed meal photo. Overlays (scan animation, chips, controls) come in as children. */
export const PhotoStage: React.FC<PhotoStageProps> = ({
  src,
  scanning = false,
  className = '',
  children,
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl border border-line bg-surface-2 ${className}`}
  >
    {/* eslint-disable-next-line @next/next/no-img-element -- local data URL, not a remote asset */}
    <img
      src={src}
      alt="The meal you photographed"
      className={`h-full w-full object-cover transition-transform duration-700 ${
        scanning ? 'scale-[1.03]' : ''
      }`}
    />
    {children}
  </div>
);
