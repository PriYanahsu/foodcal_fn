import { Button } from "@/components/ui/Button";
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-[var(--card-border)]">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                    <h2 className="text-white font-semibold">Take a Photo</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80 z-20">
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Camera View */}
                <div className="relative aspect-[4/3] bg-black">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />

                    {/* Guidelines Overlay */}
                    <div className="absolute inset-0 border-[3px] border-white/30 m-8 rounded-2xl pointer-events-none">
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
                        <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/20" />
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
                        <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/20" />

                        {/* Corner Brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--primary)] -mt-1 -ml-1 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--primary)] -mt-1 -mr-1 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--primary)] -mb-1 -ml-1 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--primary)] -mb-1 -mr-1 rounded-br-lg" />
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-center gap-8 pb-8">
                    {/* Switch Camera Button */}
                    <button
                        onClick={onSwitchCamera}
                        className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                        title="Switch Camera"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>

                    <button
                        onClick={onCapture}
                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform duration-200 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-white group-hover:bg-[var(--primary)] transition-colors duration-200" />
                    </button>

                    {/* Placeholder for symmetry */}
                    <div className="w-12" />
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
