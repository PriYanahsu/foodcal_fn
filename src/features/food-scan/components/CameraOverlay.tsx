import { XMarkIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { RefObject } from "react";

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
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center animate-fade-in overflow-hidden">
            {/* Header - Floating on top of camera */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 md:p-6 z-20">
                <button
                    onClick={onClose}
                    className="p-3 rounded-2xl bg-black/40 text-white backdrop-blur-xl hover:bg-black/60 transition-all border border-white/10"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="hidden sm:block text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-40 bg-black/40 px-4 py-2 rounded-full backdrop-blur-xl border border-white/5">
                    Scanning Mode Active
                </div>
                <button
                    onClick={onSwitchCamera}
                    className="p-3 rounded-2xl bg-black/40 text-white backdrop-blur-xl hover:bg-black/60 transition-all border border-white/10"
                    title="Switch Camera"
                >
                    <ArrowsRightLeftIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Viewport Area - Fullscreen on Mobile, Very Large on Desktop */}
            <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
                <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-6xl md:rounded-[3rem] overflow-hidden bg-neutral-900 shadow-[0_0_100px_rgba(0,0,0,0.8)] md:border md:border-white/10 transition-all duration-500 ease-out">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />

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
                                <button onClick={onClose} className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-full tracking-widest">Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls - Floating on bottom */}
            <div className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center items-center z-20">
                <button
                    onClick={onCapture}
                    className="group relative flex items-center justify-center transition-transform active:scale-90"
                >
                    {/* Ring */}
                    <div className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full border-[6px] border-white/20 group-hover:border-[var(--primary)]/30 transition-all" />
                    {/* Shutter Button */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white group-hover:bg-[var(--primary)] shadow-2xl transition-all flex items-center justify-center">
                        <div className="w-[90%] h-[90%] rounded-full border-2 border-black/5" />
                    </div>
                </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
