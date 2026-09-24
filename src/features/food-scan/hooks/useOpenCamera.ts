import { useRef, useState, useCallback, useEffect } from 'react';

type FacingMode = 'user' | 'environment';

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const buildConstraints = (
  mode: FacingMode,
  deviceId?: string
): MediaStreamConstraints => ({
  audio: false,
  video: {
    ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: mode } }),
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
});

const describeError = (err: unknown): string => {
  switch ((err as DOMException | undefined)?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera permission denied. Please allow access in browser settings.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera device found.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Camera is currently in use by another app.';
    default:
      return err instanceof Error && err.message
        ? err.message
        : 'Could not access camera. Please ensure permissions are granted.';
  }
};

export const useOpenCamera = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);

  const facingModeRef = useRef<FacingMode>('environment');
  const streamRef = useRef<MediaStream | null>(null);
  // Bumped on every start/close so a slow getUserMedia can't attach a stale stream.
  const requestIdRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const attachStream = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || video.srcObject === stream) return;

    setIsReady(false);
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video
        .play()
        .then(() => setIsReady(true))
        .catch((e) => {
          if (e.name !== 'AbortError') console.error('Error playing video:', e);
        });
    };
  }, []);

  const startStream = useCallback(
    async (mode: FacingMode, deviceId?: string) => {
      const requestId = ++requestIdRef.current;
      const previousDeviceId = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;

      // Release the current camera first — many phones can't open two at once.
      stopStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsReady(false);

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            'Camera API not available. This usually happens on insecure (HTTP) connections. Please use HTTPS or localhost.'
          );
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(buildConstraints(mode, deviceId));
        } catch (err) {
          const name = (err as DOMException).name;
          if (name !== 'OverconstrainedError' && name !== 'ConstraintNotSatisfiedError') {
            throw err;
          }
          // Some devices reject resolution/facing hints; fall back to any camera.
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (requestId !== requestIdRef.current) {
          stopStream(stream);
          return;
        }

        const devices = await navigator.mediaDevices
          .enumerateDevices()
          .then((list) => list.filter((d) => d.kind === 'videoinput'))
          .catch(() => [] as MediaDeviceInfo[]);

        if (requestId !== requestIdRef.current) {
          stopStream(stream);
          return;
        }

        // facingMode is ignored by most desktop browsers, so when a switch lands on the
        // same camera, step to the next device instead.
        const settings = stream.getVideoTracks()[0]?.getSettings() ?? {};
        if (!deviceId && previousDeviceId && settings.deviceId === previousDeviceId && devices.length > 1) {
          const index = devices.findIndex((d) => d.deviceId === previousDeviceId);
          const next = devices[(index + 1) % devices.length];
          stopStream(stream);
          await startStream(mode, next.deviceId);
          return;
        }

        streamRef.current = stream;
        setCanSwitchCamera(devices.length > 1);
        // Webcams usually don't report facingMode; treat an unknown, lone camera as a selfie cam.
        const actualFacing = settings.facingMode;
        setIsMirrored(actualFacing ? actualFacing === 'user' : devices.length <= 1 || mode === 'user');
        setError(null);
        attachStream();
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error('Error accessing camera:', err);
        setError(describeError(err));
      }
    },
    [attachStream]
  );

  const openCamera = useCallback(() => {
    setError(null);
    setIsOpen(true);
    void startStream(facingModeRef.current);
  }, [startStream]);

  const switchCamera = useCallback(async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    facingModeRef.current = facingModeRef.current === 'environment' ? 'user' : 'environment';
    try {
      await startStream(facingModeRef.current);
    } finally {
      setIsSwitching(false);
    }
  }, [isSwitching, startStream]);

  const closeCamera = useCallback(() => {
    requestIdRef.current++;
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsOpen(false);
    setIsReady(false);
    setError(null);
  }, []);

  // The stream can resolve before the overlay's <video> has mounted.
  useEffect(() => {
    if (isOpen) attachStream();
  });

  // Never leave the camera light on after the component goes away.
  useEffect(() => {
    const requestId = requestIdRef;
    const stream = streamRef;
    return () => {
      requestId.current++;
      stopStream(stream.current);
    };
  }, []);

  const captureImage = (): File | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Save the real (unmirrored) image; only the preview is mirrored.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new File([dataURLtoBlob(canvas.toDataURL('image/jpeg', 0.9))], 'captured.jpg', {
      type: 'image/jpeg',
    });
  };

  return {
    isOpen,
    error,
    isReady,
    isSwitching,
    isMirrored,
    canSwitchCamera,
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
