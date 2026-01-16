import { useRef, useState, useCallback, useEffect } from "react";

export const useOpenCamera = () => {
  const [isOpen, setIsOpen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    streamRef.current = stream;
    setIsOpen(true);
  };

  // 🔥 KEY FIX: attach stream AFTER video mounts
  useEffect(() => {
    if (isOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }
  }, [isOpen]);

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsOpen(false);
  };

  const captureImage = (): File | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    return new File(
      [dataURLtoBlob(canvas.toDataURL("image/jpeg", 0.9))],
      "captured.jpg",
      { type: "image/jpeg" }
    );
  };

  return {
    isOpen,
    openCamera,
    closeCamera,
    captureImage,
    videoRef,
    canvasRef,
  };
};

function dataURLtoBlob(dataUrl: string) {
  const [meta, content] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)![1];
  const binary = atob(content);
  const arr = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }

  return new Blob([arr], { type: mime });
}
