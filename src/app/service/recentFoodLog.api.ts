import axiosInstance from '@/lib/springboot/axios';
import type { FoodLog } from '@/features/Nutrition/type';
import { toApiDate } from '@/features/Nutrition/utils/toLocalDate';

export const getRecentFoodLogs = async (dateInput: string | Date): Promise<FoodLog[]> => {
  const date = toApiDate(dateInput);
  const response = await axiosInstance.get<FoodLog[]>(`/v1/food/logs/${date}`);
  return response.data;
};
