import axios from 'axios';
import { NutritionData } from '@/features/food-scan/types';

export const analyzeFoodImage = async (
  imageFile: File,
  additionalPrompt?: string
): Promise<NutritionData> => {
  try {
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const response = await axios.post<{ data: NutritionData }>('/api/analyze-food', {
      image: base64Image,
      additional_prompt: additionalPrompt,
    });

    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to analyze food');
    }
    throw error;
  }
};
