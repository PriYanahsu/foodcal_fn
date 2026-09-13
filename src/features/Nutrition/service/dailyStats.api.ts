import axiosInstance from "@/lib/springboot/axios";

export const getDailyStats = async (dateInput: string | Date) => {
    const date = dateInput.toString().split("T")[0]
    const response = await axiosInstance.get(`/v1/food/stats/${date}`);
    return response.data;
};