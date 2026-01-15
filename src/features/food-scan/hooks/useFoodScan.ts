'use client';
import { useState } from 'react';
import { scanFoodImage } from '../services/foodScan.api';
import { NutritionData } from '../types';

export const useFoodScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanImage = async (imageFile: File) => {
    setIsLoading(true);
    setError(null);
    setNutritionData(null);

    try {
      const response = await scanFoodImage(imageFile);
      
      if (response.success && response.data) {
        setNutritionData(response.data);
      } else {
        setError(response.error || 'Failed to scan food image');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setNutritionData(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    scanImage,
    isLoading,
    nutritionData,
    error,
    reset,
  };
};
