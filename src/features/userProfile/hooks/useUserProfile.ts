'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import axiosInstance from '@/lib/springboot/axios';
import { getLocal, profileKey, setLocal } from '@/lib/local-store';
import { getAccessToken } from '@/lib/springboot/auth-tokens';
import { ProfileData, ProfileFeedback } from '../type';
import { EMPTY_PROFILE } from '../utils/Constants';

function toProfile(
  data: Partial<ProfileData> | Record<string, unknown>,
  emailFallback = ''
): ProfileData {
  return {
    fullName: (data.fullName as string) || '',
    email: (data.email as string) || emailFallback,
    avatar_url: (data.avatar_url as string | null) ?? null,
  };
}

export function useUserProfile(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(autoFetch);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileData | null>(null);
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);

  const fetchProfile = useCallback(
    async (silent = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);
        const { data } = await axiosInstance.get<ProfileData>(`/v1/user/${user.id}`);
        const next = toProfile(data, user.email || '');
        setProfile(next);
        setSavedProfile(next);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setFeedback({ type: 'error', message: 'Failed to load profile. Please try again.' });
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!autoFetch) return;
    if (user?.id) {
      void fetchProfile();
      return;
    }
    if (!getAccessToken()) setLoading(false);
  }, [autoFetch, fetchProfile, user?.id]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const patchProfile = (
    patch: Partial<Pick<ProfileData, 'fullName' | 'avatar_url'>>
  ) => {
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

  const handleAvatarUpload = (url: string) => {
    const next = { ...profile, avatar_url: url };
    setProfile(next);
    setSavedProfile((prev) => (prev ? { ...prev, avatar_url: url } : next));
    if (user?.id) {
      const current = getLocal<Record<string, unknown>>(profileKey(user.id)) || {};
      setLocal(profileKey(user.id), { ...current, avatar_url: url });
    }
    setFeedback({ type: 'success', message: 'Profile photo updated.' });
  };

  const handleUpdate = async () => {
    if (!profile.fullName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return false;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const { status } = await axiosInstance.put(`/v1/user/update`, {
        updated_at: new Date().toISOString(),
        fullName: profile.fullName.trim(),
        avatar_url: profile.avatar_url || null,
      });

      if (status !== 200) {
        setFeedback({ type: 'error', message: 'Failed to save profile. Please try again.' });
        return false;
      }

      setSavedProfile({ ...profile });
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profile saved.' });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      setFeedback({ type: 'error', message: 'Failed to save profile. Please try again.' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    logout,
    loading,
    saving,
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
