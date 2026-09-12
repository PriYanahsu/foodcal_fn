import { useRef, useState, useCallback, useEffect } from 'react';

export const useOpenCamera = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startStream = useCallback(async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Camera API not available. This usually happens on insecure (HTTP) connections. Please use HTTPS or localhost.'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => {
            if (e.name !== 'AbortError') {
              console.error('Error playing video:', e);
            }
          });
        };
      }

      setError(null);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      let msg = 'Could not access camera. Please ensure permissions are granted.';
      if (err instanceof Error) {
        msg = err.message;
      }
      if (err.name === 'NotAllowedError')
        msg = 'Camera permission denied. Please allow access in browser settings.';
      if (err.name === 'NotFoundError') msg = 'No camera device found.';
      if (err.name === 'NotReadableError') msg = 'Camera is currently in use by another app.';

      setError(msg);
      setIsOpen(true);
    }
  }, []);

  const openCamera = async () => {
    setIsOpen(true);
    await startStream(facingMode);
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    await startStream(newMode);
  };

  useEffect(() => {
    if (isOpen && videoRef.current && !videoRef.current.srcObject) {
      startStream(facingMode);
    }
  }, [isOpen, facingMode, startStream]);

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
    setError(null);
  };

  const captureImage = (): File | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    return new File([dataURLtoBlob(canvas.toDataURL('image/jpeg', 0.9))], 'captured.jpg', {
      type: 'image/jpeg',
    });
  };

  return {
    isOpen,
    error,
    openCamera,
    closeCamera,
    switchCamera,
    captureImage,
    videoRef,
    canvasRef,
  };
};

function dataURLtoBlob(dataUrl: string) {
  const [meta, content] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)![1];
  const binary = atob(content);
  const arr = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }

  return new Blob([arr], { type: mime });
}
