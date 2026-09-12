import axiosInstance from '@/lib/springboot/axios';
import { FoodScanResponse, NutritionData } from '../types';
import { getUserId } from '@/lib/springboot/auth-tokens';

export const saveFoodLogAPI = async (
  imageFile: File, 
  nutritionData: NutritionData, 
): Promise<FoodScanResponse> => {
  const userId = getUserId();
  const formData = new FormData();
  formData.append('file', imageFile);

  formData.append(
    'foodData',
    new Blob([JSON.stringify(nutritionData)], { type: 'application/json' })
  );

  try {
    const response = await axiosInstance.post<FoodScanResponse>(
      `/v1/food/${userId}`,
      formData
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to save food log',
    };
  }
};
