import type { ReactNode, RefObject } from 'react';

export interface DailyStats {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface FoodLog {
  id: string;
  food_name: string;
  calories: number;
  created_at: string;
  meal_type: string;
  image_path: string | null;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionGoals {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
}

export type MacroKey = keyof DailyStats;

export interface MacroCardConfig {
  key: MacroKey;
  label: string;
  icon: string;
  color: string;
  unit: string;
  delay: number;
}

export interface LockedMacroPreview {
  label: string;
  icon: string;
}

export interface DailyHabit {
  key: string;
  label: string;
  icon: string;
  value: string;
  barClass: string;
}

export interface DailyNutritionProps {
  stats: DailyStats;
  goals: NutritionGoals;
  hasPlan: boolean;
  recentLogs: FoodLog[];
  loading: boolean;
  mounted: boolean;
  isToday: boolean;
  dailyLogRef: RefObject<HTMLDivElement | null>;
  logScrollable: boolean;
  onUnlock: () => void;
  children?: ReactNode;
}

export interface FitnessHubProps {
  hasPlan: boolean;
  aiCoachAdvice: string;
  targetWeightKg: number;
}

export interface NutritionHeroProps {
  uid: string;
  avatarUrl: string | null;
  userName: string;
  subtitle: string;
  selectedDate: string;
  isToday: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
  onDateChange: (days: number) => void;
  onDateSelect: (date: string) => void;
}

export interface NoPlanModalProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
}
