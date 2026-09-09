'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getAccessToken, getUserId } from '@/lib/springboot/auth-tokens';
import { ProfileData, ProfileFeedback } from '../type';
import { EMPTY_PROFILE } from '../utils/Constants';
import { getUser, updateUser, uploadAvatar } from '../service/user.api';

export function useUserProfile(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(autoFetch);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileData | null>(null);
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);

  const fetchProfile = useCallback(async (silent = false) => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      const next = await getUser(userId, user?.email || '');
      setProfile(next);
      setSavedProfile(next);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!autoFetch) return;
    if (getUserId()) {
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

  const handleAvatarUpload = async (file: File) => {
    try {
      const url = await uploadAvatar(file);
      const next = { ...profile, avatar_url: url };
      setProfile(next);
      setSavedProfile(next);
      await fetchProfile(true);
      setFeedback({ type: 'success', message: 'Profile photo updated.' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to upload photo.' });
    }
  };

  const handleUpdate = async () => {
    if (!profile.fullName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return false;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const { status } = await updateUser({
        fullName: profile.fullName.trim(),
        avatarUrl: profile.avatar_url || null,
      });

      if (status !== 200) {
        setFeedback({ type: 'error', message: 'Failed to save profile. Please try again.' });
        return false;
      }

      setSavedProfile({ ...profile });
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profile saved.' });
      return true;
    } catch {
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
