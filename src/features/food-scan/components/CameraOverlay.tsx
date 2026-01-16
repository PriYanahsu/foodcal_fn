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
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <video
        ref={videoRef}
        className="flex-1 object-cover"
        playsInline
        muted
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="p-4 flex gap-4 bg-black">
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
