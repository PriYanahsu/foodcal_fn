'use client';
import { useState } from 'react';
import { analyzeFoodImage, NutritionData } from '../services/scan.api';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useFoodScan = () => {
  const supabase = createClient();
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

      // 2. Save to Supabase (if user is logged in)
      // 2. Save to Supabase (if user is logged in)
      if (user) {
        // Upload image first
        let imagePath = null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('meal_images')
          .upload(fileName, file);

        if (!uploadError && uploadData) {
          imagePath = uploadData.path;
        }

        const { error: dbError } = await supabase.from('food_logs').insert({
          user_id: user.id,
          food_name: data.food_name,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fats: data.fats,
          confidence: data.confidence,
          meal_type: getMealType(), // Helper to guess meal type by time
          image_path: imagePath,
          is_manual: false,
        });

        if (dbError) {
          console.error("Failed to save to history:", dbError);
          // We don't block the UI if saving fails, just log it
        }
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setNutritionData(null);
    setError(null);
  };

  return {
    scanImage,
    isLoading,
    nutritionData,
    error,
    reset,
  };
};

// Helper to determine meal type based on current hour
function getMealType() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'snack';
}
