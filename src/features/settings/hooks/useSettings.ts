'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/features/theme/context/ThemeContext';
import axiosInstance from '@/lib/springboot/axios';

export const useSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('delete') === '1') {
      setShowDeleteConfirm(true);
    }
  }, [searchParams]);

  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
    setConfirmText('');
    setError(null);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setConfirmText('');
    setError(null);
    if (searchParams.get('delete') === '1') {
      router.replace('/settings');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;

    try {
      setIsDeleting(true);
      setError(null);

      const { data, status } = await axiosInstance.delete(`/v1/auth/${user?.id}`);

      if (status !== 200) {
        throw new Error(data?.message || 'Failed to delete account');
      }

      await logout();
      window.location.href = '/login';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return {
    router,
    theme,
    setTheme,
    showDeleteConfirm,
    confirmText,
    setConfirmText,
    isDeleting,
    error,
    canConfirmDelete: confirmText.trim().toUpperCase() === 'DELETE',
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteAccount,
  };
};
