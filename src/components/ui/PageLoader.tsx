import React from 'react';

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin"></div>

        {/* Inner Ring */}
        <div
          className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-r-[var(--primary)] animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1s' }}
        ></div>

        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--primary)] rounded-full blur-[2px] animate-pulse"></div>
      </div>
    </div>
  );
};
