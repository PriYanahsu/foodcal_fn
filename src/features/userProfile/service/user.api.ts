import axiosInstance from '@/lib/springboot/axios';
import { getUserId } from '@/lib/springboot/auth-tokens';
import { ProfileData } from '../type';

function pickAvatarUrl(data: Record<string, unknown>): string | null {
  const url = data.avatarUrl ?? data.avatar_url;
  return typeof url === 'string' && url.trim() ? url : null;
}

function toProfile(
  data: Partial<ProfileData> | Record<string, unknown>,
  emailFallback = ''
): ProfileData {
  const raw = data as Record<string, unknown>;
  return {
    fullName: (raw.fullName as string) || '',
    email: (raw.email as string) || emailFallback,
    avatar_url: pickAvatarUrl(raw),
  };
}

export const getUser = async (userId: string, emailFallback = ''): Promise<ProfileData> => {
  const { data } = await axiosInstance.get<Record<string, unknown>>(`/v1/user/${userId}`);
  return toProfile(data, emailFallback);
};

export const updateUser = async (payload: {
  fullName: string;
  avatarUrl: string | null;
}): Promise<{ status: number }> => {
  const { status } = await axiosInstance.put(`/v1/user/update`, {
    updatedAt: new Date().toISOString(),
    fullName: payload.fullName,
    avatarUrl: payload.avatarUrl,
  });
  return { status };
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const userId = getUserId();
  if (!userId) throw new Error('Not signed in');

  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosInstance.post<Record<string, unknown>>(
    `/v1/user/avatar/${userId}`,
    formData
  );

  const url = pickAvatarUrl(data);
  if (!url) throw new Error('Upload returned no avatar URL');
  return url;
};
