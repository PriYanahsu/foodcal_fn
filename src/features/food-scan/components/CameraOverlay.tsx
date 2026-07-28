import { XMarkIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { RefObject, useEffect } from 'react';

interface CameraOverlayProps {
  onCapture: () => void;
  onClose: () => void;
  onSwitchCamera: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  error?: string | null;
}

export const CameraOverlay = ({
  onCapture,
  onClose,
  onSwitchCamera,
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 md:p-6 z-30">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/60 text-white backdrop-blur-xl hover:bg-black/80 transition-all border border-white/15 shadow-lg"
        >
          <XMarkIcon className="w-5 h-5 shrink-0" />
          <span className="text-xs font-black uppercase tracking-widest">Close</span>
        </button>
        <div className="hidden sm:block text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-40 bg-black/40 px-4 py-2 rounded-full backdrop-blur-xl border border-white/5">
          AI Camera Active
        </div>
        <button
          type="button"
          onClick={onSwitchCamera}
          aria-label="Switch camera"
          className="p-3 rounded-2xl bg-black/60 text-white backdrop-blur-xl hover:bg-black/80 transition-all border border-white/15 shadow-lg"
          title="Switch Camera"
        >
          <ArrowsRightLeftIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Viewport Area - Fullscreen on Mobile, Very Large on Desktop */}
      <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
        <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-6xl md:rounded-[3rem] overflow-hidden bg-neutral-900 shadow-[0_0_100px_rgba(0,0,0,0.8)] md:border md:border-white/10 transition-all duration-500 ease-out">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

          {/* Minimal Guidelines */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 border-[0.5px] border-white/20 rounded-[3rem] shadow-[0_0_0_100vmax_rgba(0,0,0,0.3)]" />

            {/* Corner Accents */}
            <div className="absolute w-64 h-64 md:w-80 md:h-80 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--primary)] rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--primary)] rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--primary)] rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--primary)] rounded-br-3xl" />
            </div>
          </div>

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl z-30">
              <div className="text-center space-y-4">
                <p className="text-red-400 text-sm font-black uppercase tracking-widest">{error}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-full tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-8 md:pb-12 pt-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-xl hover:bg-white/15 transition-all min-w-[100px] justify-center"
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Cancel</span>
          </button>

          <button
            type="button"
            onClick={onCapture}
            aria-label="Capture photo"
            className="group relative flex items-center justify-center transition-transform active:scale-90"
          >
            <div className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full border-[6px] border-white/25 group-hover:border-[var(--primary)]/40 transition-all" />
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white group-hover:bg-[var(--primary)] shadow-2xl transition-all flex items-center justify-center">
              <div className="w-[90%] h-[90%] rounded-full border-2 border-black/5" />
            </div>
          </button>

          <button
            type="button"
            onClick={onSwitchCamera}
            aria-label="Switch camera"
            className="flex items-center justify-center p-3 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-xl hover:bg-white/15 transition-all min-w-[100px]"
            title="Switch Camera"
          >
            <ArrowsRightLeftIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
