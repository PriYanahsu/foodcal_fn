'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeFoodImage, saveFoodLogAPI, queryKeys } from '@/app/service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { NutritionData } from '../types';

export const useFoodScan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: ({ file, prompt }: { file: File; prompt?: string }) =>
      analyzeFoodImage(file, prompt),
  });

  const saveMutation = useMutation({
    mutationFn: ({ file, nutritionData }: { file: File; nutritionData: NutritionData }) =>
      saveFoodLogAPI(file, nutritionData),
    onSuccess: async (response) => {
      if (!response.success) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.foodLogsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dailyStatsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history }),
      ]);
    },
  });

  const scanImage = async (file: File, additionalPrompt?: string) => {
    scanMutation.reset();
    try {
      await scanMutation.mutateAsync({ file, prompt: additionalPrompt });
    } catch {
      // error is on scanMutation.error
    }
  };

  const saveFoodLog = async (imageFile: File, nutritionData: NutritionData) => {
    if (!user) return;
    try {
      const response = await saveMutation.mutateAsync({ file: imageFile, nutritionData });
      return response.success;
    } catch {
      return false;
    }
  };

  const reset = () => {
    scanMutation.reset();
    saveMutation.reset();
  };

  const scanError =
    scanMutation.error instanceof Error
      ? scanMutation.error.message
      : scanMutation.error
        ? 'Something went wrong'
        : null;
  const saveError =
    saveMutation.error instanceof Error
      ? saveMutation.error.message
      : saveMutation.error
        ? 'Failed to save meal'
        : null;

  return {
    scanImage,
    saveFoodLog,
    isLoading: scanMutation.isPending,
    isSaving: saveMutation.isPending,
    nutritionData: scanMutation.data ?? null,
    error: saveError || scanError,
    reset,
  };
};
