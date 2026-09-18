import axiosInstance from '@/lib/springboot/axios';
import { FoodScanResponse, NutritionData } from '@/features/food-scan/types';
import { getUserId } from '@/lib/springboot/auth-tokens';

export const saveFoodLogAPI = async (
  imageFile: File,
  nutritionData: NutritionData
): Promise<FoodScanResponse> => {
  const userId = getUserId();
  const formData = new FormData();
  formData.append('file', imageFile);

  formData.append(
    'foodData',
    new Blob([JSON.stringify(nutritionData)], { type: 'application/json' })
  );

  try {
    // The backend answers with the saved FoodLog entity, not a { success } envelope,
    // so a 2xx (axios throws otherwise) is what tells us the meal was stored.
    await axiosInstance.post(`/v1/food/${userId}`, formData);
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Failed to save food log',
    };
  }
};
