import { Button } from "@/components/ui/Button";
import { RefObject } from "react";

interface CameraOverlayProps {
    onCapture: () => void;
    onClose: () => void;
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const CameraOverlay = ({
    onCapture,
    onClose,
    videoRef,
    canvasRef,
}: CameraOverlayProps) => {
    return (
        <div className="relative flex flex-col gap-3">
            <div className="w-full max-w-1000 flex flex-col gap-3">
                <div className="w-full bg-blue-600 h-12 flex justify-center items-center">
                    <h1 className="font-bold text-center text-white text-2xl">Camera</h1>
                </div>
                <video
                    ref={videoRef}
                    className=" w-full"
                    autoPlay
                    playsInline
                    muted
                />
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-4">
                <Button className="flex-1" onClick={onCapture}>
                    Capture
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
};
