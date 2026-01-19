export interface AvatarUploadProps {
    uid: string;
    url: string | null;
    onUpload: (url: string) => void;
    size?: number;
    isEditing: boolean;
}

export interface ProfileData {
    username: string;
    full_name: string;
    email: string;
    gender: string;
    age: number | '';
    height: number | '';
    weight: number | '';
    activity_level: string;
    goal: string;
    avatar_url?: string | null;
    target_weight?: number | null;
    target_date?: string | null;
}