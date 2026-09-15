import axiosInstance from "@/lib/springboot/axios";
import { toApiDate } from "../utils/toLocalDate";

export const getDailyStats = async (dateInput: string | Date) => {
    const date = toApiDate(dateInput);
    const response = await axiosInstance.get(`/v1/food/stats/${date}`);
    return response.data;
};