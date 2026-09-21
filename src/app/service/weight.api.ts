import axiosInstance from '@/lib/springboot/axios';

export interface WeightPoint {
  weightKg: number;
  loggedOn: string;
}

export const logWeight = async (weightKg: number): Promise<WeightPoint> => {
  const { data } = await axiosInstance.post<WeightPoint>('/v1/weight/log', { weightKg });
  return data;
};

export const getWeights = async (userId: string): Promise<WeightPoint[]> => {
  const { data } = await axiosInstance.get<WeightPoint[]>(`/v1/weight/${userId}`);
  return data;
};
