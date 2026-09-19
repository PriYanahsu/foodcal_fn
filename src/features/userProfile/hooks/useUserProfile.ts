'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getUserId } from '@/lib/springboot/auth-tokens';
import { ProfileData, ProfileFeedback } from '../type';
import { EMPTY_PROFILE } from '../utils/Constants';
import { getUser, queryKeys, updateUser, uploadAvatar } from '@/app/service';

export function useUserProfile(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || getUserId();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.user(userId ?? ''),
    queryFn: () => getUser(userId!),
    enabled: autoFetch && !!userId,
  });

  const savedProfile = data ?? null;

  useEffect(() => {
    if (data && !isEditing) setProfile(data);
  }, [data, isEditing]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const fetchProfile = async (_silent = false) => {
    if (!userId) return;
    await refetch();
  };

  const patchProfile = (patch: Partial<Pick<ProfileData, 'fullName' | 'avatar_url'>>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const startEditing = () => {
    setFeedback(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (savedProfile) setProfile(savedProfile);
    setFeedback(null);
    setIsEditing(false);
  };

  const uploadMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (url) => {
      const next = { ...profile, avatar_url: url };
      setProfile(next);
      if (userId) queryClient.setQueryData(queryKeys.user(userId), next);
      setFeedback({ type: 'success', message: 'Profile photo updated.' });
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Failed to upload photo.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { fullName: string; avatarUrl: string | null }) => updateUser(payload),
  });

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadMutation.mutateAsync(file);
    } catch {
      // feedback already set
    }
  };

  const handleUpdate = async () => {
    if (!profile.fullName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return false;
    }

    try {
      setFeedback(null);
      const { status } = await updateMutation.mutateAsync({
        fullName: profile.fullName.trim(),
        avatarUrl: profile.avatar_url || null,
      });

      if (status !== 200) {
        setFeedback({ type: 'error', message: 'Failed to save profile. Please try again.' });
        return false;
      }

      if (userId) queryClient.setQueryData(queryKeys.user(userId), { ...profile });
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profile saved.' });
      return true;
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save profile. Please try again.' });
      return false;
    }
  };

  return {
    user,
    logout,
    loading: isLoading,
    saving: updateMutation.isPending,
    isEditing,
    profile,
    feedback,
    fetchProfile,
    patchProfile,
    startEditing,
    cancelEditing,
    handleAvatarUpload,
    handleUpdate,
  };
}
