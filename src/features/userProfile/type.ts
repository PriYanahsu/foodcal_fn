export interface AvatarUploadProps {
  uid: string;
  url: string | null;
  onUpload: (url: string) => void;
  size?: number;
  isEditing: boolean;
}

export interface ProfileData {
  fullName: string;
  email: string;
  gender: string;
  avatar_url: string | null;
  fitness_details: FitnessDetails;
}

export interface FitnessDetails {
  id: string;
  age: number;
  height: number;
  weight: number;
  activity_level: string;
  target_weight_kg: number;
  target_date: string;
  daily_calorie_target: number;
  daily_protein_target_g: number;
  daily_carbs_target_g: number;
  daily_fat_target_g: number;
  ai_coach_advice: string;
}

export const EMPTY_FITNESS_DETAILS: FitnessDetails = {
  id: '',
  age: 0,
  height: 0,
  weight: 0,
  activity_level: '',
  target_weight_kg: 0,
  target_date: '',
  daily_calorie_target: 0,
  daily_protein_target_g: 0,
  daily_carbs_target_g: 0,
  daily_fat_target_g: 0,
  ai_coach_advice: '',
};
