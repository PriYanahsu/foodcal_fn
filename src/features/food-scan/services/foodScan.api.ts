import axiosInstance from '@/lib/springboot/axios';
import { FoodScanResponse } from '../types';

export const scanFoodImage = async (imageFile: File): Promise<FoodScanResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axiosInstance.post<FoodScanResponse>('/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to scan food image',
    };
  }
};
