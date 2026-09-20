export interface AvatarUploadProps {
  uid: string;
  url: string | null;
  onUpload: (file: File) => Promise<void>;
  size?: number;
  isEditing: boolean;
  /** Shown while there is no photo — e.g. "AK". */
  initials?: string;
  /** Id for the hidden file input, so a "Change photo" label can target it. */
  inputId?: string;
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

export interface ProfileFeedback {
  type: 'success' | 'error';
  message: string;
}

export interface BodyGoalsFieldsProps {
  fitness: FitnessDetails;
  goal: string | null;
  onChange: (patch: Partial<FitnessDetails>) => void;
}

export interface IdentityCardProps {
  uid: string;
  profile: ProfileData;
  isEditing: boolean;
  saving: boolean;
  completion: number;
  onChange: (patch: Partial<Pick<ProfileData, 'fullName'>>) => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onAvatarUpload: (file: File) => Promise<void>;
}

export interface BodyGoalsCardProps extends BodyGoalsFieldsProps {
  dirty: boolean;
  saving: boolean;
  missingCount: number;
  canConsult: boolean;
  highlightConsult: boolean;
  onReset: () => void;
  onSave: () => void;
  onConsult: () => void;
}

export interface AccountCardProps {
  onLogout: () => void;
  onDelete: () => void;
}

/** Everything the phone and desktop profile layouts render — one shape, two views. */
export interface ProfileViewProps {
  uid: string;
  profile: ProfileData;
  fitness: FitnessDetails;
  goal: string | null;
  completion: number;
  missingBodyCount: number;
  nameEditing: boolean;
  nameSaving: boolean;
  fitnessDirty: boolean;
  fitnessSaving: boolean;
  canConsult: boolean;
  highlightConsult: boolean;
  onProfileChange: (patch: Partial<Pick<ProfileData, 'fullName'>>) => void;
  onStartNameEdit: () => void;
  onCancelNameEdit: () => void;
  onSaveName: () => Promise<boolean>;
  onAvatarUpload: (file: File) => Promise<void>;
  onFitnessChange: (patch: Partial<FitnessDetails>) => void;
  onResetFitness: () => void;
  onSaveFitness: () => Promise<boolean>;
  onConsult: () => void;
  onLogout: () => void;
  onDelete: () => void;
}
