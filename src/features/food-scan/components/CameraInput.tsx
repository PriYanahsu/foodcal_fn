import React, { useRef } from "react";
import { PhotoIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useOpenCamera } from "../hooks/useOpenCamera";
import { CameraOverlay } from "./CameraOverlay";

interface CameraInputProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
  children?: (openCamera: () => void, openUpload: () => void) => React.ReactNode;
}

export const CameraInput: React.FC<CameraInputProps> = ({
  onImageSelect,
  isLoading = false,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    openCamera,
    closeCamera,
    switchCamera,
    error,
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

  const openUpload = () => fileInputRef.current?.click();

  return (
    <div className="w-full">
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

      {children ? (
        children(openCamera, openUpload)
      ) : (
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            onClick={openUpload}
            disabled={isLoading}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 h-11"
          >
            <PhotoIcon className="w-4 h-4" />
            <span>Upload</span>
          </button>

          <button
            onClick={openCamera}
            disabled={isLoading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 h-11 text-xs"
          >
            <CameraIcon className="w-4 h-4" />
            <span>Open Camera</span>
          </button>
        </div>
      )}

      {isOpen && (
        <CameraOverlay
          onCapture={handleCapture}
          onClose={closeCamera}
          onSwitchCamera={switchCamera}
          videoRef={videoRef}
          canvasRef={canvasRef}
          error={error}
        />
      )}
    </div>
  );
};
