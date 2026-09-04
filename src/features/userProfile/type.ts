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

export interface ProfileFieldProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

export interface ChoiceChipsProps {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  accent?: 'primary' | 'accent';
}

export interface ProfileFeedback {
  type: 'success' | 'error';
  message: string;
}

export interface UserDetailFormProps {
  profile: ProfileData;
  isEditing: boolean;
  saving: boolean;
  onChange: (patch: Partial<Pick<ProfileData, 'fullName' | 'gender'>>) => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export interface FitnessDetailFormProps {
  fitness: FitnessDetails;
  isEditing: boolean;
  saving: boolean;
  canConsult: boolean;
  showConsultCta: boolean;
  onChange: (patch: Partial<FitnessDetails>) => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onConsult: () => void;
}
