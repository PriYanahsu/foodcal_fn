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
  avatar_url: string | null;
}

export interface FitnessDetails {
  id: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  targetWeightKg: number;
  objective: string;
  targetDate: string;
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyCarbsTargetG: number;
  dailyFatTargetG: number;
  aiCoachAdvice: string;
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
  onChange: (patch: Partial<Pick<ProfileData, 'fullName'>>) => void;
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
