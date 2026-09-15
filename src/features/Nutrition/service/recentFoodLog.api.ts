import axiosInstance from "@/lib/springboot/axios";
import type { FoodLog } from "../type";

export const getRecentFoodLogs = async (dateInput: string | Date): Promise<FoodLog[]> => {
    const date = dateInput.toString().split("T")[0]
    const response = await axiosInstance.get<FoodLog[]>(`/v1/food/logs/${date}`);
    return response.data ?? [];
};