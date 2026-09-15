import axiosInstance from "@/lib/springboot/axios";
import type { FoodLog } from "../type";
import { toApiDate } from "../utils/toLocalDate";

export const getRecentFoodLogs = async (dateInput: string | Date): Promise<FoodLog[]> => {
    const date = toApiDate(dateInput);
    const response = await axiosInstance.get<FoodLog[]>(`/v1/food/logs/${date}`);
    const data = response.data as FoodLog[] | { data?: FoodLog[]; content?: FoodLog[]; logs?: FoodLog[] };
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.logs)) return data.logs;
    return [];
};