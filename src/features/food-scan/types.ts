import { RefObject } from "react";

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

export interface NutritionCardProps {
  data: NutritionData;
  compact?: boolean;
}

export interface CameraOverlayProps {
  onCapture: () => void;
  onClose: () => void;
  onSwitchCamera: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  error?: string | null;
}

export interface CameraInputProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
  children?: (openCamera: () => void, openUpload: () => void) => React.ReactNode;
}

export const DEFAULT_CHIPS = ['Protein source', 'Carbs detected', 'Portion size', 'Fats estimate'];

export const ANALYSIS_STEPS = [
  'Detecting food items…',
  'Identifying ingredients…',
  'Estimating portions…',
  'Calculating macros…',
  'Finalizing prediction…',
] as const;