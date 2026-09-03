'use client';
import { useState } from 'react';
import { analyzeFoodImage, NutritionData } from '../services/scan.api';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useFoodScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const { user } = useAuth();

  const scanImage = async (file: File, additionalPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    setNutritionData(null);

    try {
      // 1. Analyze with OpenAI
      const data = await analyzeFoodImage(file, additionalPrompt);
      setNutritionData(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveFoodLog = async (_file: File, _data: NutritionData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save meal');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setNutritionData(null);
    setError(null);
  };

  return {
    scanImage,
    saveFoodLog,
    isLoading,
    isSaving,
    nutritionData,
    error,
    reset,
  };
};
