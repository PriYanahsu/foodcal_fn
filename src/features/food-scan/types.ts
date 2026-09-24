import { RefObject } from 'react';

export type EditableField = 'calories' | 'proteinG' | 'carbohydrateG' | 'fatG';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionData {
  foodName: string;
  quantity: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  aiConfidence: number;
  analysisNotes: string;
  imagePath?: string;
  mealType: MealType;
  isManual?: boolean;
}

export interface FoodScanResponse {
  success: boolean;
  data?: NutritionData;
  error?: string;
}

export interface CameraOverlayProps {
  onCapture: () => void;
  onClose: () => void;
  onSwitchCamera: () => void;
  /** Opens the file picker without leaving the camera. */
  onPickFromGallery?: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  error?: string | null;
  /** False until the video is playing, so the shutter can't capture a blank frame. */
  isReady?: boolean;
  isSwitching?: boolean;
  /** Mirror the preview for front-facing cameras (the saved photo is never mirrored). */
  isMirrored?: boolean;
  /** Hidden when the device has only one camera. */
  canSwitchCamera?: boolean;
}

export interface CameraInputProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
  children?: (openCamera: () => void, openUpload: () => void) => React.ReactNode;
}
