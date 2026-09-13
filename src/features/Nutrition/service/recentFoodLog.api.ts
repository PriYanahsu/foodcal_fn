import axiosInstance from "@/lib/springboot/axios";

export const getRecentFoodLogs = async (dateInput: string | Date) => {
    const date = dateInput.toString().split("T")[0]
    const response = await axiosInstance.get(`/v1/food/logs/${date}`);
    return response.data;
};