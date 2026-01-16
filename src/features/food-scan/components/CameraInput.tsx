import React, { useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useOpenCamera } from "../hooks/useOpenCamera";
import { CameraOverlay } from "./CameraOverlay";

interface CameraInputProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

export const CameraInput: React.FC<CameraInputProps> = ({
  onImageSelect,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    openCamera,
    closeCamera,
    captureImage,
    videoRef,
    canvasRef,
  } = useOpenCamera();

  const handleCapture = () => {
    const file = captureImage();
    if (file) {
      onImageSelect(file);
      closeCamera();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageSelect(file);
        }}
      />
      <div className="flex gap-3">
        <Button onClick={() => fileInputRef.current?.click()}>
          Upload Food Image
        </Button>

        <Button onClick={openCamera}>
          Open Camera
        </Button>
      </div>

        {isOpen && (
          <CameraOverlay
            onCapture={handleCapture}
            onClose={closeCamera}
            videoRef={videoRef}
            canvasRef={canvasRef}
          />
        )}
    </>
  );
};
